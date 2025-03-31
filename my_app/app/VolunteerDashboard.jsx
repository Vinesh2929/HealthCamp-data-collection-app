import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/Button";

export default function VolunteerDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Volunteer Dashboard</ThemedText>

      {/* Navigate to Patient Registration */}
      <Button
        title="Patient Registration"
        onPress={() => router.push("/PatientInfoPage")}
        style={styles.button}
      />
  
      {/* Navigate to Patient Lookup */}
      <Button
        title="Patient Lookup"
        onPress={() => router.push("/PatientLookup")} // ✅ Now links to the correct page
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F7F3", // Base background color
  },
  title: {
    fontSize: 28,
    fontWeight: "600", // DM Serif Text looks better with normal weight
    textAlign: "center",
    marginBottom: 34,
    color: "#3E7CB1", // Accent blue for emphasis
    fontFamily: "DMSerifText-Regular",
  },
  dashboardCard: {
    backgroundColor: "#DBE4EE", // Light blue for a soft card effect
    width: "90%",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#293241", // Dark navy for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#293241", // Dark navy for readability
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#3E7CB1", // Accent blue for details
    textAlign: "center",
  },
  button: {
    width: "80%",
    backgroundColor: "#3E7CB1", // Medium blue for CTA buttons
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#293241", // Dark navy shadow for depth
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",

  },
});


