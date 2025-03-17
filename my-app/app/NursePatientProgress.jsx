import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Network from "expo-network";

export default function NursePatientProgress() {
  const router = useRouter();
  const { adharNumber } = useLocalSearchParams();
  const [serverIP, setServerIP] = useState(null);
  const [patient, setPatient] = useState({
    name: "Loading...",
    registration: "Loading...",
    medical: "Loading...",
    testing: "Loading...",
    lastAppointment: "Loading...",
  });

  // Fetch local IP
  useEffect(() => {
    const fetchLocalIP = async () => {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        setServerIP(ipAddress);
      } catch (error) {
        Alert.alert("Error", "Failed to retrieve server IP.");
      }
    };
    fetchLocalIP();
  }, []);

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!serverIP) return;
      try {
        const response = await fetch(`http://${serverIP}:5001/get-patient-info/${adharNumber}`);
        if (!response.ok) throw new Error("Patient data not found.");
        
        const data = await response.json();
        console.log("✅ Patient Data:", data);

        setPatient({
          name: data.name || "Unknown",
          registration: data.registration || "Not Found",
          medical: data.medical || "Not Found",
          testing: data.testing || "Not Found",
          lastAppointment: data.lastAppointment || "No Records",
        });
      } catch (error) {
        console.error("❌ Error fetching patient data:", error);
        Alert.alert("Not Found", "No patient data found for this Aadhar number.");
      }
    };

    if (serverIP && adharNumber) {
      fetchPatientData();
    }
  }, [serverIP, adharNumber]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{patient.name}</Text>

      <View style={styles.progressContainer}>
        <ProgressCard
          title="Patient Information"
          status="View Details"
          onPress={() => router.push(`/PatientInfoPage?adharNumber=${adharNumber}`)}
        />
        <ProgressCard
          title="Appointments"
          status={`Last: ${patient.lastAppointment}`}
          onPress={() => router.push(`/MedicalHistory?adharNumber=${adharNumber}`)}
        />
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// Card Component for Patient Info & Appointments
const ProgressCard = ({ title, status, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.status}>{status}</Text>
    <Text style={styles.detailsButtonText}>View Details →</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    padding: 18,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailsButtonText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 5,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

