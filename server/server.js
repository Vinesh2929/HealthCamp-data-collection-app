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
    methods: ["GET", "POST"], // Allow POST and GET
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);
app.use(bodyParser.json());

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
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start transaction
    const {
      fname, lname, age, gender, address, village, date, worker_name, DOB, id, phone_num,  
      medicalHistory, visionHistory, socialHistory,
      familyHistory, currentSymptoms, examinationData
    } = req.body;
    // Insert Patient Basic Info
    const patientResult = await client.query(
      `INSERT INTO patients 
      (fname, lname, age, gender, address, village, date, worker_name, dob, id, phone_num) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING patient_id`,
    [fname, lname, age, gender, address, village, date, worker_name, DOB, id, phone_num]
    );
    const patient_id = patientResult.rows[0].patient_id;
    console.log("✅ Inserted Patient ID:", patient_id);
    // Insert Medical History
    const medicalResult = await client.query(
      "INSERT INTO medicalhistory (patient_id, diabetes, hypertension) VALUES ($1, $2, $3) RETURNING medical_id",
      [patient_id, medicalHistory.diabetes, medicalHistory.hypertension]
    );
    const medical_id = medicalResult.rows[0].medical_id;
    // Insert Allergies (One row per allergy)
    for (let allergy of medicalHistory.allergies) {
      if (allergy.trim() !== "") {
          await client.query(
          "INSERT INTO allergies (medical_id, allergy) VALUES ($1, $2)",
          [medical_id, allergy]
          );
      }
    }
    // Insert Medications (One row per medication)
    for (let medication of medicalHistory.medications) {
      if (medication.trim() !== "") {
          await client.query(
              "INSERT INTO medications (medical_id, medication) VALUES ($1, $2)",
              [medical_id, medication]
          );
      }
    }
    // Insert Vision History
    await client.query(
      "INSERT INTO visionhistory (patient_id, vision_type, eyewear, injuries) VALUES ($1, $2, $3, $4)",
      [patient_id, visionHistory.visionType, visionHistory.eyewear, visionHistory.injuries]
    );
    // Insert Social History
    await client.query(
      "INSERT INTO socialhistory (patient_id, smoking, drinking) VALUES ($1, $2, $3)",
      [patient_id, socialHistory.smoking, socialHistory.drinking]
    );
    // Insert Family History
    await client.query(
      "INSERT INTO familyhistory (patient_id, family_htn, family_dm) VALUES ($1, $2, $3)",
      [patient_id, familyHistory.familyHtn, familyHistory.familyDm]
    );
    // Insert Current Symptoms
    await client.query(
      "INSERT INTO currentsymptoms (patient_id, redness, vision_issues, headaches, dry_eyes, light_sensitivity, prescription) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [patient_id, currentSymptoms.redness, currentSymptoms.visionIssues, currentSymptoms.headaches, currentSymptoms.dryEyes, currentSymptoms.lightSensitivity, currentSymptoms.prescription]
    );
    // Insert Examination Data
    await client.query(
      "INSERT INTO examinationdata (patient_id, blood_pressure, heart_rate, oxygen_saturation, blood_glucose, body_temperature, vision_score, refraction_values) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [patient_id, examinationData.bloodPressure, examinationData.heartRate, examinationData.oxygenSaturation, examinationData.bloodGlucose, examinationData.bodyTemperature, examinationData.visionScore, examinationData.refractionValues]
    );
    await client.query("COMMIT"); // Commit transaction
    res.status(201).json({ message: "Patient information saved!", patient_id });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback if error occurs
    console.error("❌ Error saving patient info:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}); 
*/

// general function to let the api be set to 0.5 to show that it is in progress
async function updateStation(patientId, stationColumn) {
  try {
    const query = `UPDATE "completion.1" SET ${stationColumn} = 0.5 WHERE patient_id = $1;`;
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
      id,
      phone_num,
      adhar_number,
    } = req.body;

    // Insert Basic Info
    const patientResult = await client.query(
      `INSERT INTO patients 
      (fname, lname, age, gender, address, village, date, worker_name, dob, id, phone_num, adhar_number) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
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
        id,
        phone_num,
        adhar_number,
      ]
    );

    const patient_id = patientResult.rows[0].patient_id;

    await client.query(
      `INSERT INTO completion (patient_id) VALUES ($1) 
       ON CONFLICT DO NOTHING`,
      [patient_id]
    );

    // Update completion for "station 1"
    await client.query(
      `UPDATE completion.1 SET "station1" = 1 WHERE patient_id = $1`,
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
      `SELECT * FROM completion.1 WHERE patient_id = $1`,
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
  const patientId = 1901; // HARD-CODED Patient ID (replace this later)

  try {
    const {
      ophthalmologyHistory,
      systemicHistory,
      allergyHistory,
      contactLensesHistory,
      surgicalHistory,
    } = req.body;

    // Begin Transaction
    await client.query("BEGIN");

    // 🔹 Insert into **ophthalmology_history**
    await client.query(
      `INSERT INTO ophthalmology_history (patient_id, loss_of_vision, loss_of_vision_eye, loss_of_vision_onset, pain, duration, redness, redness_eye, redness_onset, redness_pain, redness_duration, watering, watering_eye, watering_onset, watering_pain, watering_duration, discharge_type, itching, itching_eye, itching_duration, pain_symptom, pain_symptom_eye, pain_symptom_onset, pain_symptom_duration) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [
        patientId,
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
        patientId,
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
        patientId,
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
        patientId,
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
        patientId,
        surgicalHistory.cataractOrInjury,
        surgicalHistory.retinalLasers,
      ]
    );

    await client.query(
      `UPDATE completion.1 SET "station2" = 1 WHERE patient_id = $1`,
      [patientId]
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


// Nurse Registration API
// changed it so that the nurse_id is connected to the user id and that will be used to login
/*app.post("/register", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // 🔹 Check if email already exists
    const emailCheck = await pool.query(
      "SELECT * FROM nurses WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert nurse into the database (Auto-generated nurse_id starts at 2222)
    const result = await pool.query(
      `INSERT INTO nurses (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING nurse_id`,
      [first_name, last_name, email, hashedPassword]
    );

    const nurse_id = result.rows[0].nurse_id;

    await pool.query(
      `INSERT INTO users (nurse_id) 
       VALUES ($1)`,
      [nurse_id]
    );

    res.status(201).json({
      message: "Nurse registered successfully",
      nurse_id: result.rows[0].nurse_id, // Return autogenerated sequential ID
    });
  } catch (error) {
    console.error("Error registering nurse:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

*/

app.post("/register/nurse", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // 🔹 Check if email already exists
    const emailCheck = await pool.query(
      "SELECT * FROM nurses WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert nurse into the database (Auto-generated nurse_id starts at 2222)
    const result = await pool.query(
      `INSERT INTO nurses (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING nurse_id`,
      [first_name, last_name, email, hashedPassword]
    );

    const nurse_id = result.rows[0].nurse_id; // Extract nurse_id

    // Insert into users table

    res.status(201).json({
      message: "Nurse registered successfully",
      nurse_id: nurse_id, // Return autogenerated sequential ID
    });
    await pool.query(
      `INSERT INTO users (user_id) 
       VALUES ($1)`,
      [nurse_id]
    );
  } catch (error) {
    console.error("Error registering nurse:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Nurse Login API (Use `nurse_id` instead of email)
app.get("/login/nurse", async (req, res) => {
  const { nurse_id, password } = req.body;

  try {
    // Check if nurse exists by ID
    const result = await pool.query(
      "SELECT * FROM nurses WHERE nurse_id = $1",
      [nurse_id]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Nurse ID or password" });
    }

    const nurse = result.rows[0];

    // 🔹 Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, nurse.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Nurse ID or password" });
    }

    // Generate JWT token for authentication
    const token = jwt.sign(
      { nurse_id: nurse.nurse_id, role: "nurse" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Nurse login successful",
      token,
      role: "nurse",
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/register/volunteer", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // 🔹 Check if email already exists
    const emailCheck = await pool.query(
      "SELECT * FROM volunteers WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔹 Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Insert volunteer into the database
    const result = await pool.query(
      `INSERT INTO volunteers (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING volunteer_id`,
      [first_name, last_name, email, hashedPassword]
    );

    const volunteer_id = result.rows[0].volunteer_id; // Extract volunteer_id

    res.status(201).json({
      message: "Volunteer registered successfully",
      volunteer_id: volunteer_id, // Return generated ID
    });
  } catch (error) {
    console.error("Error registering volunteer:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/login/volunteer", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔹 Check if volunteer exists by email
    const result = await pool.query(
      "SELECT * FROM volunteers WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const volunteer = result.rows[0];

    // 🔹 Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔹 Generate JWT token
    const token = jwt.sign(
      { volunteer_id: volunteer.volunteer_id, role: "volunteer" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Volunteer login successful",
      token,
      role: "volunteer",
    });
  } catch (error) {
    console.error("Error logging in volunteer:", error.message);
    res.status(500).json({ message: "Internal server error" });
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

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
