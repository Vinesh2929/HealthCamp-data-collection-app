require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

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
app.use(cors());
app.use(bodyParser.json());

app.post("/add-patient", async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN"); // Start transaction
  
      const {
        name, age, gender,
        medicalHistory, visionHistory, socialHistory,
        familyHistory, currentSymptoms, examinationData
      } = req.body;
  
      // Insert Patient Basic Info
      const patientResult = await client.query(
        "INSERT INTO patients (name, age, gender) VALUES ($1, $2, $3) RETURNING patient_id",
        [name, age, gender]
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

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});