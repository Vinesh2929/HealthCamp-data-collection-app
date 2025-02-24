import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Switch,
  Text,
} from "react-native";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Button } from "../components/Button";
import { ThemedText } from "../components/ThemedText";
import { Eye, Activity, Thermometer, Droplet, Sun } from "lucide-react-native";
import axios from "axios";
import * as Network from "expo-network";

const PatientInfoPage = () => {
  const [serverIP, setServerIP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState({
    ophthalmologyHistory: {
      lossOfVision: false,
      lossOfVisionEye: "",
      lossOfVisionOnset: "",
      pain: false,
      duration: "",
      redness: false,
      rednessEye: "",
      rednessOnset: "",
      rednessPain: false,
      rednessDuration: "",
      watering: false,
      wateringEye: "",
      wateringOnset: "",
      wateringPain: false,
      wateringDuration: "",
      dischargeType: "",
      itching: false,
      itchingEye: "",
      itchingDuration: "",
      painSymptom: false,
      painSymptomEye: "",
      painSymptomOnset: "",
      painSymptomDuration: "",
    },
    systemicHistory: {
      hypertension: false,
      diabetes: false,
      heartDisease: false,
    },
    allergyHistory: {
      dropsAllergy: false,
      tabletsAllergy: false,
      seasonalAllergy: false,
    },
    contactLensesHistory: {
      usesContactLenses: false,
      usageYears: "",
      frequency: "",
    },
    surgicalHistory: {
      cataractOrInjury: false,
      retinalLasers: false,
    },
  });

  useEffect(() => {
    const fetchLocalIP = async () => {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        setServerIP(ipAddress);
      } catch (error) {
        alert("Failed to retrieve server IP.");
      } finally {
        setLoading(false);
      }
    };
    fetchLocalIP();

    setPatientInfo((prevState) => ({
      ...prevState,
      ophthalmologyHistory: {
        ...prevState.ophthalmologyHistory,
        lossOfVisionEye: prevState.ophthalmologyHistory.lossOfVision ? prevState.ophthalmologyHistory.lossOfVisionEye || "Right" : "",
        lossOfVisionOnset: prevState.ophthalmologyHistory.lossOfVision ? prevState.ophthalmologyHistory.lossOfVisionOnset || "Sudden" : "",
        duration: prevState.ophthalmologyHistory.lossOfVision ? prevState.ophthalmologyHistory.duration || "<2 Years" : "",
        
        rednessEye: prevState.ophthalmologyHistory.redness ? prevState.ophthalmologyHistory.rednessEye || "Right" : "",
        rednessOnset: prevState.ophthalmologyHistory.redness ? prevState.ophthalmologyHistory.rednessOnset || "Gradual" : "",
        rednessDuration: prevState.ophthalmologyHistory.redness ? prevState.ophthalmologyHistory.rednessDuration || "<1 Week" : "",
        
        wateringEye: prevState.ophthalmologyHistory.watering ? prevState.ophthalmologyHistory.wateringEye || "Right" : "",
        wateringOnset: prevState.ophthalmologyHistory.watering ? prevState.ophthalmologyHistory.wateringOnset || "Sudden" : "",
        wateringDuration: prevState.ophthalmologyHistory.watering ? prevState.ophthalmologyHistory.wateringDuration || "<1 Week" : "",
        dischargeType: prevState.ophthalmologyHistory.watering ? prevState.ophthalmologyHistory.dischargeType || "Clear" : "",
        
        itchingEye: prevState.ophthalmologyHistory.itching ? prevState.ophthalmologyHistory.itchingEye || "Right" : "",
        itchingDuration: prevState.ophthalmologyHistory.itching ? prevState.ophthalmologyHistory.itchingDuration || "<1 Week" : "",
        
        painSymptomEye: prevState.ophthalmologyHistory.painSymptom ? prevState.ophthalmologyHistory.painSymptomEye || "Right" : "",
        painSymptomOnset: prevState.ophthalmologyHistory.painSymptom ? prevState.ophthalmologyHistory.painSymptomOnset || "Sudden" : "",
        painSymptomDuration: prevState.ophthalmologyHistory.painSymptom ? prevState.ophthalmologyHistory.painSymptomDuration || "<1 Week" : "",
      },
      contactLensesHistory: {
        ...prevState.contactLensesHistory,
        frequency: prevState.contactLensesHistory.usesContactLenses ? prevState.contactLensesHistory.frequency || "Daily" : "",
      },
    }));
  }, []);

  const updatePatientInfo = (section, field, value) => {
    setPatientInfo((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!serverIP) {
      alert("Server IP not available. Please try again.");
      return;
    }

    try {
      const response = await axios.post(`http://${serverIP}:5001/submit-station-2`, patientInfo, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      alert(`Patient information saved successfully! Patient ID: ${response.data.patient_id}`);
    } catch (error) {
      alert("Failed to save patient information.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.header}>Patient Medical History</ThemedText>
          
          <Section title="Ophthalmology History" icon={<Eye color="#007AFF" size={24} />}>
            <FormField
              label="Loss of Vision"
              value={patientInfo.ophthalmologyHistory.lossOfVision}
              onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "lossOfVision", value)}
            />
            {patientInfo.ophthalmologyHistory.lossOfVision && (
              <>
                <Dropdown label="Which Eye" options={["Right", "Left", "Both"]} selectedValue={patientInfo.ophthalmologyHistory.lossOfVisionEye} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "lossOfVisionEye", value)} />
                <Dropdown label="Onset" options={["Sudden", "Gradual"]} selectedValue={patientInfo.ophthalmologyHistory.lossOfVisionOnset} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "lossOfVisionOnset", value)} />
                <FormField
                  label="Pain"
                  value={patientInfo.ophthalmologyHistory.pain}
                  onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "pain", value)}
                />
                <Dropdown label="Duration" options={["<2 Years", "2-5 Years", "5+ Years"]} selectedValue={patientInfo.ophthalmologyHistory.duration} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "duration", value)} />
              </>
            )}

            <FormField
              label="Redness"
              value={patientInfo.ophthalmologyHistory.redness}
              onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "redness", value)}
            />
            {patientInfo.ophthalmologyHistory.redness && (
              <>
                <Dropdown label="Which Eye" options={["Right", "Left", "Both"]} selectedValue={patientInfo.ophthalmologyHistory.rednessEye} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "rednessEye", value)} />
                <Dropdown label="Onset" options={["Sudden", "Gradual"]} selectedValue={patientInfo.ophthalmologyHistory.rednessOnset} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "rednessOnset", value)} />
                <FormField
                  label="Pain"
                  value={patientInfo.ophthalmologyHistory.rednessPain}
                  onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "rednessPain", value)}
                />
                <Dropdown label="Duration" options={["<1 Week", "1-4 Weeks", "4+ Weeks"]} selectedValue={patientInfo.ophthalmologyHistory.rednessDuration} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "rednessDuration", value)} />
              </>
            )}

            <FormField
              label="Watering"
              value={patientInfo.ophthalmologyHistory.watering}
              onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "watering", value)}
            />
            {patientInfo.ophthalmologyHistory.watering && (
              <>
                <Dropdown label="Which Eye" options={["Right", "Left", "Both"]} selectedValue={patientInfo.ophthalmologyHistory.wateringEye} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "wateringEye", value)} />
                <Dropdown label="Onset" options={["Sudden", "Gradual"]} selectedValue={patientInfo.ophthalmologyHistory.wateringOnset } onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "wateringOnset", value)} />
                <FormField
                  label="Pain"
                  value={patientInfo.ophthalmologyHistory.wateringPain}
                  onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "wateringPain", value)}
                />
                <Dropdown label="Duration" options={["<1 Week", "1-4 Weeks", "4+ Weeks"]} selectedValue={patientInfo.ophthalmologyHistory.wateringDuration} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "wateringDuration", value)} />
                <Dropdown label="Discharge Type" options={["Clear", "Sticky"]} selectedValue={patientInfo.ophthalmologyHistory.dischargeType} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "dischargeType", value)} />
              </>
            )}

            <FormField
              label="Itching"
              value={patientInfo.ophthalmologyHistory.itching}
              onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "itching", value)}
            />
            {patientInfo.ophthalmologyHistory.itching && (
              <>
                <Dropdown label="Which Eye" options={["Right", "Left", "Both"]} selectedValue={patientInfo.ophthalmologyHistory.itchingEye } onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "itchingEye", value)} />
                <Dropdown label="Duration" options={["<1 Week", "1-4 Weeks", "4+ Weeks"]} selectedValue={patientInfo.ophthalmologyHistory.itchingDuration} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "itchingDuration", value)} />
              </>
            )}

            <FormField
              label="Eye Pain"
              value={patientInfo.ophthalmologyHistory.painSymptom}
              onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "painSymptom", value)}
            />
            {patientInfo.ophthalmologyHistory.painSymptom && (
              <>
                <Dropdown label="Which Eye" options={["Right", "Left", "Both"]} selectedValue={patientInfo.ophthalmologyHistory.painSymptomEye} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "painSymptomEye", value)} />
                <Dropdown label="Onset" options={["Sudden", "Gradual"]} selectedValue={patientInfo.ophthalmologyHistory.painSymptomOnset} onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "painSymptomOnset", value)} />
                <Dropdown label="Duration" options={["<1 Week", "1-4 Weeks", "4+ Weeks"]} selectedValue={patientInfo.ophthalmologyHistory.painSymptomDuration } onValueChange={(value) => updatePatientInfo("ophthalmologyHistory", "painSymptomDuration", value)} />
              </>
            )}
          </Section>
          
          
          <Section title="Systemic History" icon={<Activity color="#007AFF" size={24} />}>
            <FormField
              label="Hypertension (HTN)"
              value={patientInfo.systemicHistory.hypertension}
              onValueChange={(value) => updatePatientInfo("systemicHistory", "hypertension", value)}
            />
            <FormField
                  label="Diabetes (DM)"
                  value={patientInfo.systemicHistory.diabetes}
                  onValueChange={(value) => updatePatientInfo("systemicHistory", "diabetes", value)}
                />
            <FormField
                  label="Heart Disease"
                  value={patientInfo.systemicHistory.heartDisease}
                  onValueChange={(value) => updatePatientInfo("systemicHistory", "heartDisease", value)}
                />
          </Section>

          <Section title="Allergy History" icon={<Thermometer color="#007AFF" size={24} />}>
            <FormField
              label="Allergy to any drops"
              value={patientInfo.allergyHistory.dropsAllergy}
              onValueChange={(value) => updatePatientInfo("allergyHistory", "dropsAllergy", value)}
            />
            <FormField
              label="Allergy to any tablets (antibiotics)"
              value={patientInfo.allergyHistory.tabletsAllergy}
              onValueChange={(value) => updatePatientInfo("allergyHistory", "tabletsAllergy", value)}
            />
            <FormField
              label="Seasonal allergies (mostly kids)"
              value={patientInfo.allergyHistory.seasonalAllergy}
              onValueChange={(value) => updatePatientInfo("allergyHistory", "seasonalAllergy", value)}
            />
          </Section>


          <Section title="Contact Lenses History" icon={<Droplet color="#007AFF" size={24} />}>
          <FormField
              label="Do you use contact lenses?"
              value={patientInfo.contactLensesHistory.usesContactLenses}
              onValueChange={(value) => updatePatientInfo("contactLensesHistory", "usesContactLenses", value)}
            />
            {patientInfo.contactLensesHistory.usesContactLenses && (
              <>
                <Input label="How long (in years)" keyboardType="numeric" value={patientInfo.contactLensesHistory.usageYears} onChangeText={(text) => updatePatientInfo("contactLensesHistory", "usageYears", text)} />
                <Dropdown label="Frequency of Use" options={["Daily", "Non-daily"]} selectedValue={patientInfo.contactLensesHistory.frequency} onValueChange={(value) => updatePatientInfo("contactLensesHistory", "frequency", value)} />
              </>
            )}
          </Section>

          <Section title="Eye Surgical History" icon={<Eye color="#007AFF" size={24} />}>
          <FormField
              label="Cataract or Injury"
              value={patientInfo.surgicalHistory.cataractOrInjury}
              onValueChange={(value) => updatePatientInfo("surgicalHistory", "cataractOrInjury", value)}
            />
            <FormField
              label="Retinal Lasers etc"
              value={patientInfo.surgicalHistory.retinalLasers}
              onValueChange={(value) => updatePatientInfo("surgicalHistory", "retinalLasers", value)}
            />
          </Section>

          <Button title="Save Patient Information" onPress={handleSubmit} style={styles.submitButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Section = ({ title, children, icon }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon}
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    </View>
    {children}
  </View>
)

const FormField = ({ label, value, onValueChange }) => (
  <View style={styles.formField}>
    <ThemedText style={styles.formLabel}>{label}</ThemedText>
    <View style={styles.switchContainer}>
      <Text style={[styles.switchLabel, !value && styles.activeSwitchLabel]}>No</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
        thumbColor={value ? "#3B82F6" : "#F3F4F6"}
      />
      <Text style={[styles.switchLabel, value && styles.activeSwitchLabel]}>Yes</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  flex: { flex: 1 },
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 50 },
  header: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 24, color: "#1F2937" },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 8, color: "#1F2937" },
  formField: { marginBottom: 16 },
  formLabel: { fontSize: 16, fontWeight: "600", color: "#4B5563", marginBottom: 8 },
  switchContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  switchLabel: { fontSize: 14, color: "#6B7280", marginHorizontal: 8 },
  activeSwitchLabel: { color: "#3B82F6", fontWeight: "600" },
  submitButton: { marginTop: 24, marginBottom: 40, backgroundColor: "#3B82F6", borderRadius: 8, paddingVertical: 12 },
  dropdownContainer: { marginBottom: 16 },
})

export default PatientInfoPage;
