import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PatientProgress() {
  const router = useRouter();
  const { adharNumber } = useLocalSearchParams();

  // 🔹 Hardcoded Patient Progress Data (Replace with API Calls Later)
  const hardcodedProgress = {
    123456789012: {
      registration: "Complete",
      medical: "In Progress",
      testing: "Not Done",
    },
    987654321098: {
      registration: "Complete",
      medical: "Complete",
      testing: "In Progress",
    },
    555555555555: {
      registration: "In Progress",
      medical: "Not Done",
      testing: "Not Done",
    },
  };

  const patientProgress = hardcodedProgress[adharNumber] || {
    registration: "Not Found",
    medical: "Not Found",
    testing: "Not Found",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Progress</Text>

      {/* Cards now stacked vertically */}
      <View style={styles.progressContainer}>
        <ProgressCard
          title="Registration"
          status={patientProgress.registration}
        />
        <ProgressCard
          title="Medical History"
          status={patientProgress.medical}
        />
        <ProgressCard title="Vision Testing" status={patientProgress.testing} />
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🔹 Custom Card Component for Progress Status
const ProgressCard = ({ title, status }) => {
  const statusColors = {
    Complete: "#34C759",
    "In Progress": "#FFCC00",
    "Not Done": "#FF3B30",
    "Not Found": "#CCCCCC",
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.status, { backgroundColor: statusColors[status] }]}>
        {status}
      </Text>
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🔹 Updated Styles for a Vertical Layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F2F2F7", // Light gray background for a modern look
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000", // Darker text for contrast
  },
  progressContainer: {
    width: "100%", // Full width
    alignItems: "center", // Center content
  },
  card: {
    padding: 18,
    borderRadius: 15, // Rounded corners
    backgroundColor: "#FFFFFF", // White background for contrast
    width: "90%", // Wider for better readability
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4, // Android shadow
    marginBottom: 15, // Space between cards
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  status: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20, // Fully rounded status pill
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    overflow: "hidden", // Ensures no text spills
  },
  detailsButton: {
    backgroundColor: "#007AFF", // iOS blue button
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#FF3B30", // Red cancel color
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
