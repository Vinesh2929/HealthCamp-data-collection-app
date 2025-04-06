import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";

// Update this URL to match your server address
const API_BASE_URL = "http://localhost:5001";

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
  const [isSuccess, setIsSuccess] = useState(true);
  const [enableFingerprint, setEnableFingerprint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);
  
  const router = useRouter();

  // Check if fingerprint is supported
  useEffect(() => {
    const checkFingerprintSupport = async () => {
      try {
        // Dynamically import LocalAuthentication to avoid errors if not installed
        const LocalAuth = await import('expo-local-authentication').catch(() => null);
        
        if (LocalAuth) {
          // Check hardware support
          const hasHardware = await LocalAuth.hasHardwareAsync();
          
          if (hasHardware) {
            // Get supported authentication types
            const supportedTypes = await LocalAuth.supportedAuthenticationTypesAsync();
            
            // Check if fingerprint (type 1) is supported
            const hasFingerprint = supportedTypes.includes(1); // 1 = FINGERPRINT
            
            // Check if fingerprints are enrolled
            const isEnrolled = await LocalAuth.isEnrolledAsync();
            
            // Only set as supported if hardware supports it AND fingerprints are enrolled
            setFingerprintSupported(hasFingerprint && isEnrolled);
            
            if (hasFingerprint && !isEnrolled) {
              console.log("Device supports fingerprint but no fingerprints are enrolled");
            }
          } else {
            console.log("Device does not have fingerprint hardware");
            setFingerprintSupported(false);
          }
        } else {
          console.log("LocalAuthentication module not available");
          setFingerprintSupported(false);
        }
      } catch (error) {
        console.log("Error checking fingerprint support:", error);
        setFingerprintSupported(false);
      }
    };
    
    checkFingerprintSupport();
  }, []);

  const handleRegister = async () => {
    // Validate form fields
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

    setIsLoading(true);

    try {
      // Prepare user data for registration
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        enable_fingerprint: enableFingerprint && fingerprintSupported
      };

      console.log("Sending registration data:", { ...userData, password: "[HIDDEN]" });

      // Register user using the API
      const response = await axios.post(
        `${API_BASE_URL}/register`,
        userData
      );
      
      // Check if we got a user ID back
      const userId = response.data.nurse_id;
      if (!userId) {
        setMessage("Error: User ID not received from server.");
        setIsSuccess(false);
        setIsLoading(false);
        return;
      }

      // If applicable - this depends on your server implementation
      // If your server already sets the role properly during registration,
      // this step may not be needed
      try {
        await axios.put(
          `${API_BASE_URL}/update-role-progress/${userId}/${formData.role}`
        );
      } catch (error) {
        console.log("Note: Role update API call failed, but registration was successful:", error);
        // Continue anyway since registration succeeded
      }

      // Create success message
      const fingerprintMsg = enableFingerprint && fingerprintSupported
        ? " You've enabled Fingerprint authentication for future logins." 
        : "";

      setMessage(
        `Registration successful! Your ${formData.role} role is now in progress.${fingerprintMsg}`
      );
      setIsSuccess(true);
      
      // Reset form after successful registration
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "volunteer"
      });
      setEnableFingerprint(false);
      
      // Optional: Navigate to login after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with an error code
        setMessage(err.response.data.message || "Registration failed. Please try again.");
      } else if (err.request) {
        // Request was made but no response received
        setMessage("Server not responding. Please try again later.");
      } else {
        // Something else happened
        setMessage("Registration failed. Please try again.");
      }
      
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleFingerprint = () => {
    // If fingerprint isn't supported and trying to enable it
    if (!fingerprintSupported && !enableFingerprint) {
      Alert.alert(
        "Fingerprint Not Available",
        "Your device doesn't support fingerprint authentication or no fingerprints are enrolled in your device settings.",
        [{ text: "OK" }]
      );
      return;
    }
    
    const newValue = !enableFingerprint;
    setEnableFingerprint(newValue);
    
    if (newValue && fingerprintSupported) {
      Alert.alert(
        "Fingerprint Enabled",
        "You'll be able to use fingerprint authentication to log in after your account is approved.",
        [{ text: "OK" }]
      );
    }
  };

  // Test fingerprint authentication
  const testFingerprint = async () => {
    try {
      const LocalAuth = await import('expo-local-authentication').catch(() => null);
      
      if (!LocalAuth) {
        Alert.alert("Error", "Fingerprint authentication is not available on this device.");
        return;
      }
      
      const result = await LocalAuth.authenticateAsync({
        promptMessage: 'Authenticate with fingerprint',
        fallbackLabel: 'Use password instead',
      });
      
      if (result.success) {
        Alert.alert("Success", "Fingerprint authentication successful!");
      } else {
        Alert.alert(
          "Authentication Failed", 
          result.error 
            ? `Error: ${result.error}` 
            : "Fingerprint authentication failed or was cancelled."
        );
      }
    } catch (error) {
      console.log("Error testing fingerprint:", error);
      Alert.alert("Error", "There was a problem with fingerprint authentication.");
    }
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>User Registration</Text>

        {message ? (
          <Text
            style={[styles.message, isSuccess ? styles.success : styles.error]}
          >
            {message}
          </Text>
        ) : null}

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
          autoCapitalize="none"
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
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Select Role</Text>
          <Picker
            selectedValue={formData.role}
            style={styles.picker}
            onValueChange={(itemValue) => updateFormData("role", itemValue)}
          >
            <Picker.Item label="Volunteer" value="volunteer" />
            <Picker.Item label="Practitioner" value="practitioner" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>

        {/* Fingerprint Toggle Section */}
        <View style={styles.fingerprintSection}>
          <Text style={styles.sectionTitle}>Fingerprint Authentication</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              Enable fingerprint for future logins
              {!fingerprintSupported && " (Not available on this device)"}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={enableFingerprint ? '#2196F3' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleFingerprint}
              value={enableFingerprint}
              disabled={!fingerprintSupported}
            />
          </View>
          
          {fingerprintSupported && (
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={testFingerprint}
            >
              <Text style={styles.testButtonText}>Test Fingerprint</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.fingerprintDescription}>
            Fingerprint authentication allows for quick and secure login without typing your password.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Already registered? Login here</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    textAlign: "left",
  },
  picker: {
    width: "100%",
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
  disabledButton: {
    backgroundColor: "#b0d8f5",
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
  fingerprintSection: {
    marginTop: 10,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  fingerprintDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  testButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  testButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});