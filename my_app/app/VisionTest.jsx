import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Network from "expo-network";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { Button, Card } from "react-native-paper";
import { useRouter } from "expo-router";

// 📌 Fetch and Store API URL
const getServerIP = async (setServerIP, setLoading) => {
  try {
    const ipAddress = await Network.getIpAddressAsync();
    console.log("📡 Local IP Address:", ipAddress);
    setServerIP(ipAddress);
  } catch (error) {
    console.error("❌ Error fetching local IP:", error);
    Alert.alert("Error", "Failed to retrieve server IP.");
  } finally {
    setLoading(false);
  }
};

const VisionTest = () => {
  const { adharNumber } = useLocalSearchParams();
  const [serverIP, setServerIP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientID, setPatientID] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  const [visionTestData, setVisionTestData] = useState({
    sphere: "",
    cylinder: "",
    axis: "",
    pd: "",
    notes: "",
    staff_id: "",
  });
  const [selectedEye, setSelectedEye] = useState("right");

  useEffect(() => {
    getServerIP(setServerIP, setLoading);
  }, []);

  useEffect(() => {
    const fetchPatientID = async () => {
      if (!serverIP || !adharNumber) return;

      try {
        const response = await axios.get(`http://${serverIP}:5001/get-patient-id/${adharNumber}`);

        if (response.status === 200 && response.data.patient_id) {
          setPatientID(response.data.patient_id);
        } else {
          console.warn("❌ No patient found.");
          Alert.alert("Error", "No patient found for the given Aadhar number.");
        }
      } catch (error) {
        console.error("❌ Error fetching patient ID:", error);
        Alert.alert("Error", "Failed to retrieve patient ID.");
      }
    };

    if (serverIP) {
      fetchPatientID();
    }
  }, [serverIP, adharNumber]);

  useEffect(() => {
    const fetchVisionTestResults = async () => {
      if (!serverIP || !patientID) return;

      try {
        const response = await axios.get(`http://${serverIP}:5001/get-vision-test/${patientID}`);

        if (response.status === 200) {
          // Store fetched test data
          const fetchedData = response.data;
          
          if (fetchedData[selectedEye]) {
            setVisionTestData({
              sphere: fetchedData[selectedEye].sphere || "",
              cylinder: fetchedData[selectedEye].cylinder || "",
              axis: fetchedData[selectedEye].axis || "",
              pd: fetchedData[selectedEye].pd || "",
              notes: fetchedData[selectedEye].notes || "",
              staff_id: fetchedData[selectedEye].staff_id || "",
            });
          }
        } else {
          console.warn("⚠️ No vision test data found.");
        }
      } catch (error) {
        console.error("❌ Error fetching vision test data:", error);
        Alert.alert("Error", "Failed to retrieve vision test results.");
      }
    };

    if (serverIP && patientID) {
      fetchVisionTestResults();
    }
  }, [serverIP, patientID, selectedEye]);

  const handleSubmitVisionTest = async () => {
  if (!serverIP) {
    Alert.alert("Error", "Server IP not available. Please try again.");
    return;
  }
  if (!patientID) {
    Alert.alert("Error", "Patient ID is missing. Cannot save test.");
    return;
  }
  if (!visionTestData.staff_id || visionTestData.staff_id.trim() === "") {
    Alert.alert("Error", "Staff ID is required to submit the test.");
    return;
  }

    try {
      const response = await axios.post(
        `http://${serverIP}:5001/vision-test-results`,
        { patient_id: patientID, ...visionTestData, eye: selectedEye },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setTimeout(async () => {
        try {
          const completionResponse = await axios.get(
            `http://${serverIP}:5001/check-vision-completion/${patientID}`
          );

          const station3 = parseInt(completionResponse.data.station3);
  
          if (completionResponse.status === 200 && station3 === 1.0) {
            // ✅ Both eyes tested -> Redirect to Patient Progress
            Alert.alert("Success", "Both eyes tested! Returning to Patient Progress.", [
              { text: "OK", onPress: () => router.replace(`/PatientProgress?adharNumber=${adharNumber}`) },
            ]);
          } else {
            // ✅ Only one eye tested -> Ask user to complete the other one
            Alert.alert("Success", "Vision test result saved! Test the other eye.");
          }
        } catch (error) {
          console.error("❌ Error checking completion:", error);
          Alert.alert("Error", "Could not verify completion status.");
        }
      }, 500);  // ✅ Delay to ensure DB update
    } catch (error) {
      console.error("❌ Error submitting vision  test:", error);
      Alert.alert("Error", "Failed to submit vision test. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Autorefractor Test</Text>

      <Card style={styles.card}>
        <Text style={styles.title}>Autorefractor Test</Text>

        {/* Eye Selection */}
        <View style={styles.eyeSelectionContainer}>
        <TouchableOpacity
            style={[styles.eyeButton, selectedEye === "right" && styles.activeEye]}
            onPress={() => {
              setSelectedEye("right");
              setVisionTestData({ sphere: "", cylinder: "", axis: "", pd: "", notes: "", staff_id: visionTestData.staff_id });
            }}
          >
            <Text style={[styles.eyeText, selectedEye === "right" && styles.activeEyeText]}>
              Right Eye
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.eyeButton, selectedEye === "left" && styles.activeEye]}
            onPress={() => {
              setSelectedEye("left");
              setVisionTestData({ sphere: "", cylinder: "", axis: "", pd: "", notes: "", staff_id: visionTestData.staff_id });
            }}
          >
            <Text style={[styles.eyeText, selectedEye === "left" && styles.activeEyeText]}>
              Left Eye
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <TextInput style={styles.input} placeholder="Sphere (±0.00)" keyboardType="numeric"
          value={visionTestData.sphere} onChangeText={(text) => setVisionTestData({ ...visionTestData, sphere: text })} />
        <TextInput style={styles.input} placeholder="Cylinder (±0.00)" keyboardType="numeric"
          value={visionTestData.cylinder} onChangeText={(text) => setVisionTestData({ ...visionTestData, cylinder: text })} />
        <TextInput style={styles.input} placeholder="Axis (0-180)" keyboardType="numeric"
          value={visionTestData.axis} onChangeText={(text) => setVisionTestData({ ...visionTestData, axis: text })} />
        <TextInput style={styles.input} placeholder="PD (mm)" keyboardType="numeric"
          value={visionTestData.pd} onChangeText={(text) => setVisionTestData({ ...visionTestData, pd: text })} />
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Notes" multiline
          value={visionTestData.notes} onChangeText={(text) => setVisionTestData({ ...visionTestData, notes: text })} />
        <TextInput style={styles.input} placeholder="Staff ID" 
          value={visionTestData.staff_id} onChangeText={(text) => setVisionTestData({ ...visionTestData, staff_id: text })} />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button mode="contained" style={styles.saveButton} onPress={handleSubmitVisionTest} loading={loading} disabled={loading}>
            Save
          </Button>
          <Button mode="outlined" style={styles.resetButton} onPress={() => setVisionTestData({ sphere: "", cylinder: "", axis: "", pd: "", notes: "", staff_id: "" })} disabled={loading}>
            Reset
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
};

// 🔹 **Updated Styles**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 16, color: "#333" },
  card: { margin: 10, padding: 20, borderRadius: 15, backgroundColor: "#fff", elevation: 3 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16, color: "#555" },
  
  eyeSelectionContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  eyeButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, margin: 5, borderColor: "#3b82f6" },
  activeEye: { backgroundColor: "#3b82f6" },
  eyeText: { fontSize: 16, fontWeight: "500", color: "#3b82f6" },
  activeEyeText: { color: "white" },

  input: { backgroundColor: "#f2f2f2", marginVertical: 10, borderRadius: 12, padding: 14, fontSize: 16 },
  
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  saveButton: { flex: 1, marginRight: 8, backgroundColor: "#6a4caf", padding: 10, borderRadius: 12 },
  resetButton: { flex: 1, marginRight: 8, borderColor: "#6a4caf", padding: 10, borderWidth: 1, borderRadius: 12 },
});

export default VisionTest;