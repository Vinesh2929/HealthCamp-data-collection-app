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
      <Button
        title="Medical History"
        onPress={() => router.push("/MedicalHistory")}
        style={styles.button}
      />
      <Button
        title="Additional Testing"
        onPress={() => router.push("/VisionTest")}
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
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#007AFF",
  },
  button: {
    width: "80%",
    marginBottom: 16,
  },
});
