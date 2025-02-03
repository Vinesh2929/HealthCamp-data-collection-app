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
app.use(cors({
  origin: "*", // Allow all origins (use specific origins in production)
  methods: ["GET", "POST"], // Allow POST and GET
  allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
}));
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

    const percentage = total > 0 ? ((diabeticCount / total) * 100).toFixed(2) : 0;
    res.status(200).json({ village, percentageDiabetes: `${percentage}%` });
  } catch (error) {
    console.error("❌ Error fetching diabetes data:", error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}); 

app.post("/add-patient", async (req, res) => {
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

// Nurse Registration API
app.post("/register", async (req, res) => {
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

    res.status(201).json({
      message: "Nurse registered successfully",
      nurse_id: result.rows[0].nurse_id, // Return autogenerated sequential ID
    });
  } catch (error) {
    console.error("Error registering nurse:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Nurse Login API (Use `nurse_id` instead of email)
app.get("/login", async (req, res) => {
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
      { nurse_id: nurse.nurse_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
