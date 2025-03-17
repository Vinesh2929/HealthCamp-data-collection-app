import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/Button";

export default function NurseDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Nurse Dashboard</ThemedText>

      {/* Navigate to Patient Lookup */}
      <Button
        title="Search Patient Records"
        onPress={() => router.push("/NursePatientLookup")}
        style={styles.button}
      />

      {/* Navigate to View Reports */}
      <Button
        title="View Reports"
        onPress={() => router.push("/reports")}
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
