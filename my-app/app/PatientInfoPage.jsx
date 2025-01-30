import React, { useState } from "react"
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from "react-native"
import { Input } from "../components/Input"
import { Dropdown } from "../components/Dropdown"
import { Checkbox } from "../components/Checkbox"
import { Button } from "../components/Button"
import { ThemedText } from "../components/ThemedText"
import { PlusCircle, Eye, Activity, Thermometer, Droplet, Sun } from "lucide-react-native"

const PatientInfoPage = () => {
  const [patientInfo, setPatientInfo] = useState({
    medicalHistory: {
      diabetes: false,
      hypertension: false,
      medications: [""],
      allergies: [""],
    },
    visionHistory: {
      visionType: "",
      eyewear: "",
      injuries: "",
    },
    socialHistory: {
      smoking: "",
      drinking: "",
    },
    familyHistory: {
      familyHtn: false,
      familyDm: false,
    },
    currentSymptoms: {
      redness: false,
      visionIssues: false,
      headaches: false,
      dryEyes: false,
      lightSensitivity: false,
      prescription: "",
    },
    examinationData: {
      vitalSigns: "",
      visionScore: "",
      refractionValues: "",
    },
  })

  const updatePatientInfo = (section, field, value) => {
    setPatientInfo((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: value,
      },
    }))
  }

  const addNewField = (section, field) => {
    setPatientInfo((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: [...prevState[section][field], ""],
      },
    }))
  }

  const updateArrayField = (section, field, index, value) => {
    const updatedArray = [...patientInfo[section][field]]
    updatedArray[index] = value
    setPatientInfo((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: updatedArray,
      },
    }))
  }

  const handleSubmit = () => {
    console.log("Patient Info:", patientInfo)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText style={styles.header}>Patient Information</ThemedText>

          <Section title="Medical History" icon={<Thermometer color="#007AFF" size={24} />}>
            <Checkbox
              label="Diabetes (DM)"
              checked={patientInfo.medicalHistory.diabetes}
              onCheck={(value) => updatePatientInfo("medicalHistory", "diabetes", value)}
            />
            <Checkbox
              label="Hypertension (HTN)"
              checked={patientInfo.medicalHistory.hypertension}
              onCheck={(value) => updatePatientInfo("medicalHistory", "hypertension", value)}
            />

            {patientInfo.medicalHistory.medications.map((med, index) => (
              <Input
                key={index}
                label={`Medication ${index + 1}`}
                value={med}
                onChangeText={(text) => updateArrayField("medicalHistory", "medications", index, text)}
              />
            ))}
            <AddFieldButton onPress={() => addNewField("medicalHistory", "medications")} />

            {patientInfo.medicalHistory.allergies.map((allergy, index) => (
              <Input
                key={index}
                label={`Allergy ${index + 1}`}
                value={allergy}
                onChangeText={(text) => updateArrayField("medicalHistory", "allergies", index, text)}
              />
            ))}
            <AddFieldButton onPress={() => addNewField("medicalHistory", "allergies")} />
          </Section>

          <Section title="Vision History" icon={<Eye color="#007AFF" size={24} />}>
            <Dropdown
              label="Vision Type"
              options={["Nearsightedness", "Farsightedness", "Normal"]}
              selectedValue={patientInfo.visionHistory.visionType}
              onValueChange={(value) => updatePatientInfo("visionHistory", "visionType", value)}
              small
            />
            <Dropdown
              label="Eyewear"
              options={["None", "Glasses", "Contact Lenses", "Both"]}
              selectedValue={patientInfo.visionHistory.eyewear}
              onValueChange={(value) => updatePatientInfo("visionHistory", "eyewear", value)}
              small
            />
            <Input
              label="Previous Eye Injuries or Surgeries"
              value={patientInfo.visionHistory.injuries}
              onChangeText={(text) => updatePatientInfo("visionHistory", "injuries", text)}
              multiline
            />
          </Section>

          <Section title="Social History" icon={<Activity color="#007AFF" size={24} />}>
            <Dropdown
              label="Smoking Habits"
              options={["Non-smoker", "Former smoker", "Current smoker"]}
              selectedValue={patientInfo.socialHistory.smoking}
              onValueChange={(value) => updatePatientInfo("socialHistory", "smoking", value)}
              small
            />
            <Dropdown
              label="Drinking Habits"
              options={["Non-drinker", "Occasional", "Regular", "Heavy"]}
              selectedValue={patientInfo.socialHistory.drinking}
              onValueChange={(value) => updatePatientInfo("socialHistory", "drinking", value)}
              small
            />
          </Section>

          <Section title="Family History" icon={<Droplet color="#007AFF" size={24} />}>
            <Checkbox
              label="Family history of Hypertension"
              checked={patientInfo.familyHistory.familyHtn}
              onCheck={(value) => updatePatientInfo("familyHistory", "familyHtn", value)}
            />
            <Checkbox
              label="Family history of Diabetes"
              checked={patientInfo.familyHistory.familyDm}
              onCheck={(value) => updatePatientInfo("familyHistory", "familyDm", value)}
            />
          </Section>

          <Section title="Current Eye Symptoms" icon={<Sun color="#007AFF" size={24} />}>
            <View style={styles.checkboxGrid}>
              <CheckboxWithIcon
                label="Redness"
                checked={patientInfo.currentSymptoms.redness}
                onCheck={(value) => updatePatientInfo("currentSymptoms", "redness", value)}
                icon={<View style={[styles.iconCircle, { backgroundColor: "#FF6B6B" }]} />}
              />
              <CheckboxWithIcon
                label="Vision Issues"
                checked={patientInfo.currentSymptoms.visionIssues}
                onCheck={(value) => updatePatientInfo("currentSymptoms", "visionIssues", value)}
                icon={<Eye color="#4ECDC4" size={20} />}
              />
              <CheckboxWithIcon
                label="Headaches"
                checked={patientInfo.currentSymptoms.headaches}
                onCheck={(value) => updatePatientInfo("currentSymptoms", "headaches", value)}
                icon={<Activity color="#FFD93D" size={20} />}
              />
              <CheckboxWithIcon
                label="Dry Eyes or Tearing"
                checked={patientInfo.currentSymptoms.dryEyes}
                onCheck={(value) => updatePatientInfo("currentSymptoms", "dryEyes", value)}
                icon={<Droplet color="#6E44FF" size={20} />}
              />
              <CheckboxWithIcon
                label="Light Sensitivity"
                checked={patientInfo.currentSymptoms.lightSensitivity}
                onCheck={(value) => updatePatientInfo("currentSymptoms", "lightSensitivity", value)}
                icon={<Sun color="#F7B801" size={20} />}
              />
              <CheckboxWithIcon
              label="Prescription Glasses/Lenses"
              checked={patientInfo.currentSymptoms.prescription}
              onCheck={(value) => updatePatientInfo("currentSymptoms", "prescription", value)}
              icon={<Eye color="#4ECDC4" size={20} />}
            />
            </View>
          </Section>

          <Section title="Examination Data" icon={<Thermometer color="#007AFF" size={24} />}>
          <Input
            label="Blood Pressure (mmHg)"
            value={patientInfo.examinationData.bloodPressure}
            onChangeText={(text) => updatePatientInfo("examinationData", "bloodPressure", text)}
            placeholder="e.g., 120/80"
          />
          <Input
            label="Heart Rate (bpm)"
            value={patientInfo.examinationData.heartRate}
            onChangeText={(text) => updatePatientInfo("examinationData", "heartRate", text)}
            keyboardType="numeric"
          />
          <Input
            label="Oxygen Saturation (% SpO₂)"
            value={patientInfo.examinationData.oxygenSaturation}
            onChangeText={(text) => updatePatientInfo("examinationData", "oxygenSaturation", text)}
            keyboardType="numeric"
          />
          <Input
            label="Blood Glucose (mg/dL)"
            value={patientInfo.examinationData.bloodGlucose}
            onChangeText={(text) => updatePatientInfo("examinationData", "bloodGlucose", text)}
            keyboardType="numeric"
          />
          <Input
            label="Body Temperature (°C)"
            value={patientInfo.examinationData.bodyTemperature}
            onChangeText={(text) => updatePatientInfo("examinationData", "bodyTemperature", text)}
            keyboardType="numeric"
          />
            <Input
              label="Vision Score (WHO scale)"
              value={patientInfo.examinationData.visionScore}
              onChangeText={(text) => updatePatientInfo("examinationData", "visionScore", text)}
              keyboardType="numeric"
            />
            <Input
              label="Refraction Values (OS/OD - Cylindrical)"
              value={patientInfo.examinationData.refractionValues}
              onChangeText={(text) => updatePatientInfo("examinationData", "refractionValues", text)}
            />
          </Section>

          <Button title="Save Patient Information" onPress={handleSubmit} style={styles.submitButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const Section = ({ title, children, icon }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon}
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    </View>
    {children}
  </View>
)

const AddFieldButton = ({ onPress }) => (
  <TouchableOpacity style={styles.addButton} onPress={onPress}>
    <PlusCircle size={24} color="#007AFF" />
    <ThemedText style={styles.addButtonText}>Add More</ThemedText>
  </TouchableOpacity>
)

const CheckboxWithIcon = ({ label, checked, onCheck, icon }) => (
  <View style={styles.checkboxWithIcon}>
    <View style={styles.checkboxContainer}>
      <Checkbox label={label} checked={checked} onCheck={onCheck} />
    </View>
    <View style={styles.iconContainer}>{icon}</View>
  </View>
)

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#007AFF",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30, // Added bottom margin to avoid overlap
    alignSelf: "flex-start", // Ensures button stays aligned to the left
  },
  addButtonText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
  checkboxGrid: {
    marginBottom: 16,
  },
  checkboxWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    width: "100%",
  },
  checkboxContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
})

export default PatientInfoPage