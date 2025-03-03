import React, { useState } from "react";
import { View, Text, TextInput, Picker, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer", // Default role selection
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (Object.values(formData).some((value) => !value)) {
      setMessage("Please fill in all fields.");
      setIsSuccess(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Register user
      const response = await axios.post("http://localhost:5001/register", userData);
      const userId = response.data.user_id;

      // Update role to 0.5 in the users table
      await axios.put(`http://localhost:5001/update-role-progress/${userId}/${formData.role}`);

      setMessage(`Registration successful! Your ${formData.role} role is now in progress.`);
      setIsSuccess(true);
    } catch (err) {
      setMessage("Registration failed. Please try again.");
      setIsSuccess(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>User Registration</Text>

        {message ? <Text style={[styles.message, isSuccess ? styles.success : styles.error]}>{message}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formData.firstName}
          onChangeText={(value) => updateFormData("firstName", value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={formData.lastName}
          onChangeText={(value) => updateFormData("lastName", value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => updateFormData("email", value)}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => updateFormData("password", value)}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData("confirmPassword", value)}
          secureTextEntry
        />

        {/* Role Dropdown */}
        <Picker
          selectedValue={formData.role}
          style={styles.picker}
          onValueChange={(itemValue) => updateFormData("role", itemValue)}
        >
          <Picker.Item label="Volunteer" value="volunteer" />
          <Picker.Item label="Practitioner" value="practitioner" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")} style={styles.link}>
          <Text style={styles.linkText}>Already registered? Login here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    marginBottom: 15,
    fontSize: 16,
    textAlign: "center",
  },
  success: {
    color: "green",
  },
  error: {
    color: "red",
  },
  link: {
    marginTop: 15,
    alignItems: "center",
  },
  linkText: {
    color: "#2196F3",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

