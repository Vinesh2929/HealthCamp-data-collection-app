require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to YugabyteDB:", err.stack);
  } else {
    console.log("✅ Successfully connected to YugabyteDB on port 5433");
  }
  release(); // Release the client back to the pool
});

// Initialize Express App
const app = express();
app.use(
  cors({
    origin: "*", // Allow all origins (use specific origins in production)
    methods: ["GET", "POST", "PUT"], // Adding PUT method also
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);
app.use(bodyParser.json());

// ===================================================
// IMPORTANT: THIS IS THE FIXED LOGIN ROUTE
// I've removed the duplicate login route that was at the bottom of the file
// and fixed this one to properly handle the hardcoded admin
// ===================================================
app.post("/login", async (req, res) => {
  // Debug logging to see what's being received
  console.log("Login attempt received:", req.body);
  
  const { email, password, role } = req.body;

  // HARDCODED ADMIN - This bypasses all database checks
  // ===================================================
  if (email === "admin@healthcamp.com" && password === "admin123" && role === "admin") {
    console.log("✅ HARDCODED ADMIN LOGIN SUCCESSFUL");
    
    // Generate JWT token for hardcoded admin
    const token = jwt.sign(
      { user_id: 999, role: "admin" },
      process.env.JWT_SECRET || "fallback-secret-key", // Fallback in case JWT_SECRET is not set
      { expiresIn: "1h" }
    );
    
    return res.status(200).json({ 
      message: "Login successful", 
      token, 
      role: "admin", 
      user_id: 999 
    });
  }
  
  // If we get here, it's not the hardcoded admin - use regular auth flow
  // ===================================================
  try {
    // 🔹 Check if user exists in the `nurses` table
    const nurseResult = await pool.query("SELECT * FROM nurses WHERE email = $1", [email]);
    if (nurseResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const nurse = nurseResult.rows[0];

    // 🔹 Validate password
    const isMatch = await bcrypt.compare(password, nurse.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔹 Retrieve the user's role status from `users` table
    const userResult = await pool.query(
      "SELECT user_id, COALESCE(volunteer, 0) AS volunteer, COALESCE(practitioner, 0) AS practitioner, COALESCE(admin, 0) AS admin FROM users WHERE user_id = $1",
      [nurse.nurse_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User role not found. Please contact admin." });
    }

    const user = userResult.rows[0];

    console.log(`🛠 Checking roles: User ID ${user.user_id}, Volunteer: ${user.volunteer}, Practitioner: ${user.practitioner}, Admin: ${user.admin}`);

    // 🔹 Check if the selected role is properly authorized (should be `1`)
    if (
      (role === "practitioner" && parseInt(user.practitioner) !== 1) ||
      (role === "volunteer" && parseInt(user.volunteer) !== 1) ||
      (role === "admin" && parseInt(user.admin) !== 1)
    ) {
      return res.status(403).json({ message: "Your selected role is not authorized. Request approval from an admin." });
    }

    // 🔹 Generate JWT token
    const token = jwt.sign({ user_id: user.user_id, role }, process.env.JWT_SECRET || "fallback-secret-key", { expiresIn: "1h" });

    res.json({ message: "Login successful", token, role, user_id: user.user_id });
  } catch (error) {
    console.error("❌ Error logging in:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ===================================================
// The rest of your routes below - no changes needed
// ===================================================

app.get("/percentage-diabetes/:village", async (req, res) => {
  const { village } = req.params;
  const client = await pool.connect();
  try {
    const totalResult = await client.query(
      "SELECT COUNT(*) AS total FROM patients WHERE village = $1",
      [village]
    );

    const diabeticResult = await client.query(
      `SELECT COUNT(*) AS diabetic_count 
       FROM patients p 
       JOIN medicalhistory m ON p.patient_id = m.patient_id 
       WHERE p.village = $1 AND m.diabetes = true`,
      [village]
    );

    const total = parseInt(totalResult.rows[0].total);
    const diabeticCount = parseInt(diabeticResult.rows[0].diabetic_count);

    const percentage =
      total > 0 ? ((diabeticCount / total) * 100).toFixed(2) : 0;
    res.status(200).json({ village, percentageDiabetes: `${percentage}%` });
  } catch (error) {
    console.error("❌ Error fetching diabetes data:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

/*app.post("/add-patient", async (req, res) => {
  // Commented out as per original code
}); */

// general function to let the api be set to 0.5 to show that it is in progress
async function updateStation(patientId, stationColumn) {
  try {
    const query = `UPDATE "completion1" SET ${stationColumn} = 0.5 WHERE patient_id = $1;`;
    await pool.query(query, [patientId]);
    return { success: true, message: `${stationColumn} updated to 0.5 for patient ${patientId}` };
  } catch (error) {
    console.error('Error updating station:', error);
    return { success: false, error: error.message };
  }
}

// apis that set the stations to be in progress by setting the value as 0.5 
app.put('/api/station1-progress/:patient_id', async (req, res) => {
  const result = await updateStation(req.params.patient_id, 'station1');
  res.json(result);
});

app.put('/api/station2-progress/:patient_id', async (req, res) => {
  const result = await updateStation(req.params.patient_id, 'station2');
  res.json(result);
});

app.put('/api/station3-progress/:patient_id', async (req, res) => {
  const result = await updateStation(req.params.patient_id, 'station3');
  res.json(result);
});

// post the info from the station 1 and when it is complete it will set the station 1 from the completion table to true
app.post("/station-1-patient-info", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      fname,
      lname,
      age,
      gender,
      address,
      village,
      date,
      worker_name,
      DOB,
      phone_num,
      adhar_number,
    } = req.body;

    // Insert Basic Info
    const patientResult = await client.query(
      `INSERT INTO patients 
      (fname, lname, age, gender, address, village, date, worker_name, dob, phone_num, adhar_number) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING patient_id`,
      [
        fname,
        lname,
        age,
        gender,
        address,
        village,
        date,
        worker_name,
        DOB,
        phone_num,
        adhar_number,
      ]
    );

    const patient_id = patientResult.rows[0].patient_id;

    await client.query(
      `INSERT INTO completion1 (patient_id) VALUES ($1) 
       ON CONFLICT DO NOTHING`,
      [patient_id]
    );

    // Update completion for "station 1"
    await client.query(
      `UPDATE completion1 SET "station1" = 1 WHERE patient_id = $1`,
      [patient_id]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Basic patient info saved!", patient_id });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error in Station 1 API:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// show the completion info from the patients adhar number
app.get("/get-completion-by-adhar/:adharNumber", async (req, res) => {
  const client = await pool.connect();
  const { adharNumber } = req.params;

  try {
    // First, find the patient_id by searching for the adhar_number
    const patientResult = await client.query(
      `SELECT patient_id FROM patients WHERE adhar_number = $1`,
      [adharNumber]
    );

    if (patientResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Patient not found with this Adhar number." });
    }

    const patientId = patientResult.rows[0].patient_id;

    // Now, find the completion information for the corresponding patient_id
    const completionResult = await client.query(
      `SELECT * FROM completion1 WHERE patient_id = $1`,
      [patientId]
    );

    if (completionResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No completion data found for this patient." });
    }

    res.status(200).json(completionResult.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching completion data:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// get info from the 1st station form
app.get("/get-station-1-info/:patientId", async (req, res) => {
  const client = await pool.connect();
  const { patientId } = req.params;

  try {
    const result = await client.query(
      `SELECT fname, lname, age, gender, address, village, date, 
              worker_name, dob, id, phone_num, adhar_number 
       FROM patients 
       WHERE patient_id = $1`,
      [patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching patient basic info:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// get info from the 2nd station form
app.get("/get-station-2-info/:patientId", async (req, res) => {
  const client = await pool.connect();
  const { patientId } = req.params;

  try {
    // Fetch all related details from different tables
    const query = `
      SELECT m.diabetes, m.hypertension, a.allergy, med.medication, 
             v.vision_type, v.eyewear, v.injuries, 
             s.smoking, s.drinking, 
             f.family_htn, f.family_dm, 
             c.redness, c.vision_issues, c.headaches, c.dry_eyes, c.light_sensitivity, c.prescription,
             e.blood_pressure, e.heart_rate, e.oxygen_saturation, e.blood_glucose, 
             e.body_temperature, e.vision_score, e.refraction_values
      FROM medicalhistory m
      LEFT JOIN allergies a ON a.medical_id = m.medical_id
      LEFT JOIN medications med ON med.medical_id = m.medical_id
      LEFT JOIN visionhistory v ON v.patient_id = m.patient_id
      LEFT JOIN socialhistory s ON s.patient_id = m.patient_id
      LEFT JOIN familyhistory f ON f.patient_id = m.patient_id
      LEFT JOIN currentsymptoms c ON c.patient_id = m.patient_id
      LEFT JOIN examinationdata e ON e.patient_id = m.patient_id
      WHERE m.patient_id = $1
    `;

    const result = await client.query(query, [patientId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No additional information found." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching additional patient info:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.post("/submit-station-2", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      patient_id,
      ophthalmologyHistory,
      systemicHistory,
      allergyHistory,
      contactLensesHistory,
      surgicalHistory,
    } = req.body;

    console.log("📥 Received Patient ID:", patient_id);

    if (!patient_id) {
      console.error("❌ Error: Missing patient ID in request.");
      return res.status(400).json({ error: "Patient ID is required." });
    }

    const patientCheck = await client.query(
      `SELECT patient_id FROM patients WHERE patient_id = $1`,
      [patient_id]
    );

    if (patientCheck.rows.length === 0) {
      console.error("❌ Error: Patient ID does not exist in the patients table.");
      return res.status(400).json({ error: "Invalid patient ID, patient not found." });
    }

    const duplicateCheck = await client.query(
      `SELECT * FROM ophthalmology_history WHERE patient_id = $1`,
      [patient_id]
    );

    if (duplicateCheck.rows.length > 0) {
      console.warn("⚠️ Duplicate Submission Attempted.");
      return res.status(400).json({ error: "Form has already been submitted for this patient." });
    }

    // Begin Transaction
    await client.query("BEGIN");

    // 🔹 Insert into **ophthalmology_history**
    await client.query(
      `INSERT INTO ophthalmology_history (patient_id, loss_of_vision, loss_of_vision_eye, loss_of_vision_onset, pain, duration, redness, redness_eye, redness_onset, redness_pain, redness_duration, watering, watering_eye, watering_onset, watering_pain, watering_duration, discharge_type, itching, itching_eye, itching_duration, pain_symptom, pain_symptom_eye, pain_symptom_onset, pain_symptom_duration) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [
        patient_id,
        ophthalmologyHistory.lossOfVision,
        ophthalmologyHistory.lossOfVisionEye,
        ophthalmologyHistory.lossOfVisionOnset,
        ophthalmologyHistory.pain,
        ophthalmologyHistory.duration,
        ophthalmologyHistory.redness,
        ophthalmologyHistory.rednessEye,
        ophthalmologyHistory.rednessOnset,
        ophthalmologyHistory.rednessPain,
        ophthalmologyHistory.rednessDuration,
        ophthalmologyHistory.watering,
        ophthalmologyHistory.wateringEye,
        ophthalmologyHistory.wateringOnset,
        ophthalmologyHistory.wateringPain,
        ophthalmologyHistory.wateringDuration,
        ophthalmologyHistory.dischargeType,
        ophthalmologyHistory.itching,
        ophthalmologyHistory.itchingEye,
        ophthalmologyHistory.itchingDuration,
        ophthalmologyHistory.painSymptom,
        ophthalmologyHistory.painSymptomEye,
        ophthalmologyHistory.painSymptomOnset,
        ophthalmologyHistory.painSymptomDuration,
      ]
    );

    // 🔹 Insert into **systemic_history**
    await client.query(
      `INSERT INTO systemic_history (patient_id, hypertension, diabetes, heart_disease) 
      VALUES ($1, $2, $3, $4)`,
      [
        patient_id,
        systemicHistory.hypertension,
        systemicHistory.diabetes,
        systemicHistory.heartDisease,
      ]
    );

    // 🔹 Insert into **allergy_history**
    await client.query(
      `INSERT INTO allergy_history (patient_id, drops_allergy, tablets_allergy, seasonal_allergy) 
      VALUES ($1, $2, $3, $4)`,
      [
        patient_id,
        allergyHistory.dropsAllergy,
        allergyHistory.tabletsAllergy,
        allergyHistory.seasonalAllergy,
      ]
    );

    // 🔹 Insert into **contact_lenses_history**
    await client.query(
      `INSERT INTO contact_lenses_history (patient_id, uses_contact_lenses, usage_years, frequency) 
      VALUES ($1, $2, $3, $4)`,
      [
        patient_id,
        contactLensesHistory.usesContactLenses,
        contactLensesHistory.usageYears || null,
        contactLensesHistory.frequency,
      ]
    );

    // 🔹 Insert into **surgical_history**
    await client.query(
      `INSERT INTO surgical_history (patient_id, cataract_or_injury, retinal_lasers) 
      VALUES ($1, $2, $3)`,
      [
        patient_id,
        surgicalHistory.cataractOrInjury,
        surgicalHistory.retinalLasers,
      ]
    );

    await client.query(
      `INSERT INTO completion1 (patient_id) VALUES ($1) 
       ON CONFLICT (patient_id) DO NOTHING`,
      [patient_id]
    );

    // 🔹 Mark Station 2 as "Complete"
    await client.query(
      `UPDATE completion1 SET station2 = 1 WHERE patient_id = $1`,
      [patient_id]
    );

    // Commit Transaction
    await client.query("COMMIT");

    res.status(200).json({ message: "Patient data saved successfully!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error storing patient data:", error);
    res.status(500).json({ error: "Failed to store patient data" });
  } finally {
    client.release();
  }
});

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

app.get("/lookup-patient-nurse/:adharNumber", async (req, res) => {
  const { adharNumber } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT patient_id, fname, lname, age, dob, gender, address, village, phone_num 
       FROM patients 
       WHERE adhar_number = $1`,
      [adharNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const patientData = result.rows[0];

    // Format DOB before sending response
    patientData.dob = formatDate(patientData.dob);

    const { patient_id } = patientData;

    // ✅ Fetch medical history tables
    const ophthalmologyHistory = await client.query(
      `SELECT * FROM ophthalmology_history WHERE patient_id = $1`,
      [patient_id]
    );

    const systemicHistory = await client.query(
      `SELECT * FROM systemic_history WHERE patient_id = $1`,
      [patient_id]
    );

    const allergyHistory = await client.query(
      `SELECT * FROM allergy_history WHERE patient_id = $1`,
      [patient_id]
    );

    const contactLensesHistory = await client.query(
      `SELECT * FROM contact_lenses_history WHERE patient_id = $1`,
      [patient_id]
    );

    const surgicalHistory = await client.query(
      `SELECT * FROM surgical_history WHERE patient_id = $1`,
      [patient_id]
    );

    // ✅ Combine patient details & history
    const responseData = {
      ...patientData,
      medicalHistory: {
        ophthalmologyHistory: ophthalmologyHistory.rows[0] || {},
        systemicHistory: systemicHistory.rows[0] || {},
        allergyHistory: allergyHistory.rows[0] || {},
        contactLensesHistory: contactLensesHistory.rows[0] || {},
        surgicalHistory: surgicalHistory.rows[0] || {},
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching patient details:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/lookup-patient/:adharNumber", async (req, res) => {
  const { adharNumber } = req.params;
  const client = await pool.connect();

  try {
    // 🔹 Fetch patient details by Aadhar number
    const result = await client.query(
      `SELECT fname, lname, age, gender, village, phone_num 
       FROM patients 
       WHERE adhar_number = $1`,
      [adharNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching patient details:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.post("/register", async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  try {
    // Check if email already exists
    const emailCheck = await pool.query("SELECT * FROM nurses WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into `nurses` table (Auto-generates `nurse_id`)
    const nurseResult = await pool.query(
      `INSERT INTO nurses (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING nurse_id`,
      [first_name, last_name, email, hashedPassword]
    );

    const nurse_id = nurseResult.rows[0].nurse_id; // Nurse ID (Auto-generated)

    // Set selected role to 0.5 (pending approval), others to 0
    const volunteer = role === "volunteer" ? 0.5 : 0;
    const practitioner = role === "practitioner" ? 0.5 : 0;
    const admin = role === "admin" ? 0.5 : 0;

    // Insert into `users` table (user_id = nurse_id)
    await pool.query(
      `INSERT INTO users (user_id, volunteer, practitioner, admin) 
       VALUES ($1, $2, $3, $4)`,
      [nurse_id, volunteer, practitioner, admin]
    );

    res.status(201).json({
      message: "User registered successfully",
      nurse_id, // Nurse ID and User ID are the same
    });
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//ADMIN AUTHORIZATION: Get Pending Users (role = 0.5)
app.get("/pending-users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, n.first_name, n.last_name, n.email, 
              CASE 
                WHEN u.practitioner = 0.5 THEN 'practitioner' 
                WHEN u.volunteer = 0.5 THEN 'volunteer' 
                WHEN u.admin = 0.5 THEN 'admin' 
              END AS role 
       FROM users u
       JOIN nurses n ON u.user_id = n.nurse_id  -- Connect users and nurses
       WHERE u.practitioner = 0.5 OR u.volunteer = 0.5 OR u.admin = 0.5`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching pending users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//ADMIN AUTHORIZATION: Approve User (Change Role to 1)
app.put("/approve-user/:user_id/:role", async (req, res) => {
  const { user_id, role } = req.params;

  if (!["practitioner", "volunteer", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified" });
  }

  try {
    await pool.query(`UPDATE users SET ${role} = 1 WHERE user_id = $1`, [user_id]);
    res.status(200).json({ message: `User ${user_id} approved as ${role}` });
  } catch (error) {
    console.error("❌ Error approving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET USER ROLES BY USER_ID 
app.get("/get-user-roles/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query("SELECT volunteer, practitioner, admin FROM users WHERE user_id = $1", [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching user roles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//UPDATE ROLE TO IN-PROGRESS (0.5) 
app.put("/update-role-progress/:user_id/:role", async (req, res) => {
  const { user_id, role } = req.params;

  if (!["practitioner", "volunteer", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified" });
  }

  try {
    await pool.query(`UPDATE users SET ${role} = 0.5 WHERE user_id = $1`, [user_id]);
    res.status(200).json({ message: `Updated ${role} to 0.5 for user ${user_id}` });
  } catch (error) {
    console.error("❌ Error updating role progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get-patient-info/:adharNumber", async (req, res) => {
  const client = await pool.connect();

  try {
    const { adharNumber } = req.params;

    const result = await client.query(
      `SELECT fname, lname, age, gender, address, village, date, worker_name, dob, phone_num, adhar_number FROM patients WHERE adhar_number = $1`,
      [adharNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({error: "Patient not found"});
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching patient data", error);
    res.status(500).json({ error: error.message});
  } finally {
    client.release();
  }
})

app.get("/get-patient-id/:adharNumber", async (req, res) => {
  const client = await pool.connect();
  const { adharNumber } = req.params;

  try {
    const result = await client.query(
      `SELECT patient_id FROM patients WHERE adhar_number = $1`,
      [adharNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ patient_id: result.rows[0].patient_id });
  } catch (error) {
    console.error("❌ Error fetching patient ID:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/get-patient-history/:patient_id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { patient_id } = req.params;

    // ✅ Check if patient exists
    const patientCheck = await client.query(
      `SELECT patient_id FROM patients WHERE patient_id = $1`,
      [patient_id]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found." });
    }

    // ✅ Retrieve data from all tables
    const ophthalmologyHistory = await client.query(
      `SELECT * FROM ophthalmology_history WHERE patient_id = $1`,
      [patient_id]
    );

    const systemicHistory = await client.query(
      `SELECT * FROM systemic_history WHERE patient_id = $1`,
      [patient_id]
    );

    const allergyHistory = await client.query(
      `SELECT * FROM allergy_history WHERE patient_id = $1`,
      [patient_id]
    );

    const contactLensesHistory = await client.query(
      `SELECT * FROM contact_lenses_history WHERE patient_id = $1`,
      [patient_id]
    );

    const surgicalHistory = await client.query(
      `SELECT * FROM surgical_history WHERE patient_id = $1`,
      [patient_id]
    );

    // ✅ Check if history exists (otherwise return empty defaults)
    const patientHistory = {
      ophthalmologyHistory: ophthalmologyHistory.rows[0] || {},
      systemicHistory: systemicHistory.rows[0] || {},
      allergyHistory: allergyHistory.rows[0] || {},
      contactLensesHistory: contactLensesHistory.rows[0] || {},
      surgicalHistory: surgicalHistory.rows[0] || {},
    };

    res.status(200).json(patientHistory);

  } catch (error) {
    console.error("❌ Error fetching patient history:", error);
    res.status(500).json({ error: "Failed to retrieve patient history." });
  } finally {
    client.release();
  }
});

// Add this temporary endpoint to get table information
app.get("/db-schema", async (req, res) => {
  const client = await pool.connect();
  try {
    // Get all tables
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const tables = await client.query(tableQuery);
    
    // Get columns for each table
    const schema = {};
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      const columnQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `;
      const columns = await client.query(columnQuery, [tableName]);
      
      schema[tableName] = columns.rows;
    }
    
    res.status(200).json(schema);
  } catch (error) {
    console.error("Error fetching schema:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Add these endpoints to your server.js file

// Get disease trends over time
app.get("/disease-trends/:timeframe", async (req, res) => {
  const { timeframe } = req.params; // "week", "month", or "year"
  const client = await pool.connect();
  
  try {
    // Different SQL queries based on the requested timeframe
    let query;
    
    if (timeframe === "week") {
      // Last 7 days data, grouped by day
      query = `
        SELECT 
          TO_CHAR(p.date, 'YYYY-MM-DD') AS date_group,
          p.village,
          COUNT(p.patient_id) AS total_patients,
          COUNT(CASE WHEN s.diabetes = true THEN 1 END) AS diabetes_count,
          COUNT(CASE WHEN s.hypertension = true THEN 1 END) AS hypertension_count,
          COUNT(CASE WHEN s.heart_disease = true THEN 1 END) AS heart_disease_count
        FROM 
          patients p
        LEFT JOIN 
          systemic_history s ON p.patient_id = s.patient_id
        WHERE 
          p.date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY 
          date_group, p.village
        ORDER BY 
          date_group, p.village
      `;
    } else if (timeframe === "month") {
      // Last 30 days data, grouped by week
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('week', p.date), 'YYYY-MM-DD') AS date_group,
          p.village,
          COUNT(p.patient_id) AS total_patients,
          COUNT(CASE WHEN s.diabetes = true THEN 1 END) AS diabetes_count,
          COUNT(CASE WHEN s.hypertension = true THEN 1 END) AS hypertension_count,
          COUNT(CASE WHEN s.heart_disease = true THEN 1 END) AS heart_disease_count
        FROM 
          patients p
        LEFT JOIN 
          systemic_history s ON p.patient_id = s.patient_id
        WHERE 
          p.date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY 
          date_group, p.village
        ORDER BY 
          date_group, p.village
      `;
    } else { // year
      // Last 12 months data, grouped by month
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', p.date), 'YYYY-MM') AS date_group,
          p.village,
          COUNT(p.patient_id) AS total_patients,
          COUNT(CASE WHEN s.diabetes = true THEN 1 END) AS diabetes_count,
          COUNT(CASE WHEN s.hypertension = true THEN 1 END) AS hypertension_count,
          COUNT(CASE WHEN s.heart_disease = true THEN 1 END) AS heart_disease_count
        FROM 
          patients p
        LEFT JOIN 
          systemic_history s ON p.patient_id = s.patient_id
        WHERE 
          p.date >= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY 
          date_group, p.village
        ORDER BY 
          date_group, p.village
      `;
    }

    const result = await client.query(query);
    
    // Format data for chart
    const formattedData = {
      labels: [],
      datasets: [],
      villages: []
    };
    
    // Group by village
    const villageData = {};
    
    result.rows.forEach(row => {
      if (!villageData[row.village]) {
        villageData[row.village] = {
          diabetes: [],
          hypertension: [],
          heart_disease: []
        };
        formattedData.villages.push(row.village);
      }
      
      // Add date to labels if not already there
      if (!formattedData.labels.includes(row.date_group)) {
        formattedData.labels.push(row.date_group);
      }
      
      // Calculate percentages
      const diabetesPercentage = row.total_patients > 0 
        ? ((row.diabetes_count / row.total_patients) * 100).toFixed(1) 
        : 0;
        
      const hypertensionPercentage = row.total_patients > 0 
        ? ((row.hypertension_count / row.total_patients) * 100).toFixed(1) 
        : 0;
        
      const heartDiseasePercentage = row.total_patients > 0 
        ? ((row.heart_disease_count / row.total_patients) * 100).toFixed(1) 
        : 0;
      
      villageData[row.village].diabetes.push(parseFloat(diabetesPercentage));
      villageData[row.village].hypertension.push(parseFloat(hypertensionPercentage));
      villageData[row.village].heart_disease.push(parseFloat(heartDiseasePercentage));
    });
    
    // Create datasets for each village and disease
    Object.keys(villageData).forEach((village, index) => {
      // Colors for different villages
      const colors = [
        ['rgba(255, 69, 0, 1)', 'rgba(255, 69, 0, 0.7)', 'rgba(255, 69, 0, 0.4)'],  // Red/Orange
        ['rgba(34, 139, 34, 1)', 'rgba(34, 139, 34, 0.7)', 'rgba(34, 139, 34, 0.4)'], // Green
        ['rgba(65, 105, 225, 1)', 'rgba(65, 105, 225, 0.7)', 'rgba(65, 105, 225, 0.4)'], // Blue
        ['rgba(128, 0, 128, 1)', 'rgba(128, 0, 128, 0.7)', 'rgba(128, 0, 128, 0.4)']  // Purple
      ];
      
      formattedData.datasets.push({
        village: village,
        disease: 'Diabetes',
        data: villageData[village].diabetes,
        strokeWidth: 3,
        color: (opacity = 1) => colors[index % colors.length][0].replace('1)', `${opacity})`),
      });
      
      formattedData.datasets.push({
        village: village,
        disease: 'Hypertension',
        data: villageData[village].hypertension,
        strokeWidth: 3,
        color: (opacity = 1) => colors[index % colors.length][1].replace('1)', `${opacity})`),
      });
      
      formattedData.datasets.push({
        village: village,
        disease: 'Heart Disease',
        data: villageData[village].heart_disease,
        strokeWidth: 3,
        color: (opacity = 1) => colors[index % colors.length][2].replace('1)', `${opacity})`),
      });
    });

    // Get overall patient and disease counts
    const countQuery = `
      SELECT 
        COUNT(DISTINCT p.patient_id) AS total_patients,
        COUNT(DISTINCT CASE WHEN s.diabetes = true THEN p.patient_id END) AS total_diabetes,
        COUNT(DISTINCT CASE WHEN s.hypertension = true THEN p.patient_id END) AS total_hypertension,
        COUNT(DISTINCT CASE WHEN s.heart_disease = true THEN p.patient_id END) AS total_heart_disease
      FROM patients p
      LEFT JOIN systemic_history s ON p.patient_id = s.patient_id
    `;
    
    const countResult = await client.query(countQuery);
    const summary = countResult.rows[0];
    
    res.status(200).json({ 
      chartData: formattedData,
      summary: summary
    });
    
  } catch (error) {
    console.error("❌ Error fetching disease trends:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Get staff count for admin dashboard
app.get("/staff-count", async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Count both nurses and volunteers
    const nursesResult = await client.query("SELECT COUNT(*) AS nurse_count FROM nurses");
    const volunteersResult = await client.query("SELECT COUNT(*) AS volunteer_count FROM volunteers");
    
    const nurseCount = parseInt(nursesResult.rows[0].nurse_count);
    const volunteerCount = parseInt(volunteersResult.rows[0].volunteer_count);
    
    res.status(200).json({ 
      count: nurseCount + volunteerCount,
      nurseCount: nurseCount,
      volunteerCount: volunteerCount
    });
  } catch (error) {
    console.error("❌ Error fetching staff count:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Get patient count for admin dashboard
app.get("/patient-count", async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query("SELECT COUNT(DISTINCT patient_id) AS patient_count FROM patients");
    res.status(200).json({ count: parseInt(result.rows[0].patient_count) });
  } catch (error) {
    console.error("❌ Error fetching patient count:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Get disease distribution by village
app.get("/disease-distribution", async (req, res) => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        p.village,
        COUNT(DISTINCT p.patient_id) AS total_patients,
        COUNT(DISTINCT CASE WHEN s.diabetes = true THEN p.patient_id END) AS diabetes_count,
        COUNT(DISTINCT CASE WHEN s.hypertension = true THEN p.patient_id END) AS hypertension_count,
        COUNT(DISTINCT CASE WHEN s.heart_disease = true THEN p.patient_id END) AS heart_disease_count
      FROM patients p
      LEFT JOIN systemic_history s ON p.patient_id = s.patient_id
      GROUP BY p.village
      ORDER BY total_patients DESC
    `;
    
    const result = await client.query(query);
    
    // Format the data for the chart
    const data = result.rows.map(row => {
      const totalPatients = parseInt(row.total_patients);
      
      return {
        village: row.village,
        totalPatients: totalPatients,
        diabetesPercentage: totalPatients > 0 
          ? ((parseInt(row.diabetes_count) / totalPatients) * 100).toFixed(1) 
          : 0,
        hypertensionPercentage: totalPatients > 0 
          ? ((parseInt(row.hypertension_count) / totalPatients) * 100).toFixed(1) 
          : 0,
        heartDiseasePercentage: totalPatients > 0 
          ? ((parseInt(row.heart_disease_count) / totalPatients) * 100).toFixed(1) 
          : 0
      };
    });
    
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching disease distribution:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Add this temporary endpoint to your server.js
app.get("/add-test-patients", async (req, res) => {
  const client = await pool.connect();
  try {
    // First, insert 5 new patients
    await client.query(`
      INSERT INTO patients (fname, lname, age, gender, address, village, date, worker_name, dob, phone_num)
      VALUES 
        ('Raj', 'Patel', 45, 'Male', '23 Main Road', 'Sundarpur', CURRENT_DATE, 'Health Worker', '1980-01-15', '9876543210'),
        ('Priya', 'Sharma', 52, 'Female', '45 Lake View', 'Gopalnagar', CURRENT_DATE, 'Health Worker', '1972-03-22', '8765432109'),
        ('Arjun', 'Mehta', 38, 'Male', '12 Station Road', 'Sundarpur', CURRENT_DATE, 'Health Worker', '1987-07-10', '7654321098'),
        ('Lakshmi', 'Reddy', 61, 'Female', '78 Temple Street', 'Krishnapur', CURRENT_DATE, 'Health Worker', '1964-11-05', '6543210987'),
        ('Mohan', 'Singh', 56, 'Male', '34 River Road', 'Gopalnagar', CURRENT_DATE, 'Health Worker', '1968-09-18', '5432109876')
    `);
    
    // Get the newly inserted patient IDs
    const patientResult = await client.query(`
      SELECT patient_id FROM patients 
      WHERE 
        (fname = 'Raj' AND lname = 'Patel') OR
        (fname = 'Priya' AND lname = 'Sharma') OR
        (fname = 'Arjun' AND lname = 'Mehta') OR
        (fname = 'Lakshmi' AND lname = 'Reddy') OR
        (fname = 'Mohan' AND lname = 'Singh')
      ORDER BY patient_id DESC 
      LIMIT 5
    `);
    
    // Insert systemic_history records for each patient
    for (const row of patientResult.rows) {
      await client.query(`
        INSERT INTO systemic_history (patient_id, diabetes, hypertension, heart_disease)
        VALUES ($1, TRUE, FALSE, FALSE)
      `, [row.patient_id]);
    }
    
    res.status(200).json({ message: "Added 5 test patients with diabetes" });
  } catch (error) {
    console.error("Error adding test patients:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/api/nurses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM nurses");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching nurses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user roles
app.get("/api/user-roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user role
app.put("/api/update-role/:user_id/:role", async (req, res) => {
  const { user_id, role } = req.params;
  const { value } = req.body;

  if (!["volunteer", "practitioner", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified" });
  }

  try {
    await pool.query(`UPDATE users SET ${role} = $1 WHERE user_id = $2`, [value, user_id]);
    res.status(200).json({ message: `Updated ${role} to ${value} for user ${user_id}` });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});