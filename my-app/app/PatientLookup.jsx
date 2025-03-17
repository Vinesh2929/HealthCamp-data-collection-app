
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Network from "expo-network";

export default function PatientLookup() {
  const [serverIP, setServerIP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adharNumber, setAdharNumber] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);
  const router = useRouter();

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
  }, []);

  const fetchPatientInfo = async () => {
    if (!adharNumber) {
      Alert.alert("Error", "Please enter an Aadhar number.");
      return;
    }
  
    if (!serverIP) {
      Alert.alert("Error", "Server IP not available yet. Please try again.");
      return;
    }
  
    try {
      const response = await fetch(`http://${serverIP}:5001/lookup-patient/${adharNumber}`);
  
      if (!response.ok) {
        throw new Error("Patient not found");
      }
  
      const data = await response.json();
      setPatientInfo(data);
    } catch (error) {
      Alert.alert("Not Found", "No patient found with this Aadhar number.");
      setPatientInfo(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Lookup</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Aadhar Number"
        keyboardType="numeric"
        value={adharNumber}
        onChangeText={setAdharNumber}
      />

      <TouchableOpacity style={styles.button} onPress={fetchPatientInfo}>
        <Text style={styles.buttonText}>Search Patient</Text>
      </TouchableOpacity>

      {patientInfo && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            👤 {patientInfo.fname} {patientInfo.lname}
          </Text>
          <Text style={styles.resultText}>📅 Age: {patientInfo.age}</Text>
          <Text style={styles.resultText}>🚻 Gender: {patientInfo.gender}</Text>
          <Text style={styles.resultText}>
            🏡 Village: {patientInfo.village}
          </Text>
          <Text style={styles.resultText}>
            📞 Phone: {patientInfo.phone_num}
          </Text>

          {/* ✅ Add Button to Navigate to Patient Progress */}
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() =>
              router.push({
                pathname: "/PatientProgress",
                params: { adharNumber: adharNumber },
              })
            }
          >
            <Text style={styles.buttonText}>View Progress</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Add Back Button to Volunteer Dashboard */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/volunteerDashboard")}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F7F3",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textcolor: "3f6c51",
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#E5CEDC",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    marginBottom: 10,
  },
  progressButton: {
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#98C1D9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "white",
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 4,
  },
});
