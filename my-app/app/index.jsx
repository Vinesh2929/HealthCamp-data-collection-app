
import React from "react";
import { View, StyleSheet, Image, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/Button";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/healthcarelogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <ThemedText style={styles.title}>
          Welcome to HealthCare Camp
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Data Collection Mobile App
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Button
            title="Login"
            onPress={() => router.push("/login")}
            style={styles.loginButton}
            textStyle={styles.buttonText}
          />

          <Button
            title="Register"
            onPress={() => router.push("/register")}
            style={styles.registerButton}
            textStyle={styles.buttonText}
          />
        </View>

        <View style={styles.decorativeElement} />
        <View style={styles.decorativeElement2} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7F3",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#DBE4EE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3E7CB1",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#3E7CB1",
    marginBottom: 40,
    fontStyle: "italic",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  loginButton: {
    width: "80%",
    backgroundColor: "#3E7CB1",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButton: {
    width: "80%",
    backgroundColor: "#E5CEDC",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  decorativeElement: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#E5CEDC",
    opacity: 0.2,
    top: "15%",
    right: "-10%",
  },
  decorativeElement2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DBE4EE",
    opacity: 0.3,
    bottom: "15%",
    left: "-5%",
  },
  decorativeElement3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#E5CEDC",
    opacity: 0.2,
    top: "25%",
    left: "-10%",
  },
  decorativeElement4: {
    position: "absolute",
    width: 150,
    height: 100,
    borderRadius: 75,
    backgroundColor: "#DBE4EE",
    opacity: 0.3,
    bottom: "25%",
    right: "-5%",
  },
});