import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/Button";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        Welcome to HealthCare Camp Data Collection Mobile App
      </ThemedText>

      {/* Admin Login Button - No navigation */}
      <Button
        title="Login"
        onPress={() => router.push("/login")}
        style={styles.button}
      />

      {/* Healthcare Worker Login Button - Navigates to login.tsx */}
      <Button
        title="Register"
        onPress={() => router.push("/register")}
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
