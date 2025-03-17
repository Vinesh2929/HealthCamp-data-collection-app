import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import axios from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("volunteer"); // Default role
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your credentials.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/login", {
        email,
        password,
        role: selectedRole,
      });

      const { user_id, token } = response.data;

      // Redirect based on role
      if (selectedRole === "volunteer") {
        router.replace("/VolunteerDashboard");
      } else if (selectedRole === "practitioner") {
        router.replace("/NurseDashboard");
      } else if (selectedRole === "admin") {
        router.replace("/AdminDashboard");
      }
    } catch (error) {
      Alert.alert("Wait for Admin Authorization to Login");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Role Selection Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRole}
            onValueChange={(itemValue) => setSelectedRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Volunteer" value="volunteer" />
            <Picker.Item label="Practitioner" value="practitioner" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.linkText}>New user? Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ StyleSheet for all styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: "white",
  },
  picker: {
    width: "100%",
    height: 200,
    color: "#000",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#2196F3",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
