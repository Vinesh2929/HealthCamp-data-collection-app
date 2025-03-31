import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import axios from "axios";

// Update this URL to match your server address
const API_BASE_URL = "http://localhost:5001";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("volunteer"); // Default role
  const [loading, setLoading] = useState(false);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);
  const [deviceId, setDeviceId] = useState(""); // A unique identifier for the device
  
  const router = useRouter();

  // Check for fingerprint support on component mount
  useEffect(() => {
    const checkFingerprintSupport = async () => {
      try {
        // Generate a device ID if not already done
        // In a real app, this could be a secure device identifier
        // For this example, we'll use a random string
        const generatedDeviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
        setDeviceId(generatedDeviceId);
        
        // Check for fingerprint support
        const LocalAuth = await import('expo-local-authentication').catch(() => null);
        if (LocalAuth) {
          const hasHardware = await LocalAuth.hasHardwareAsync();
          if (hasHardware) {
            const supportedTypes = await LocalAuth.supportedAuthenticationTypesAsync();
            const hasFingerprint = supportedTypes.includes(1); // 1 = FINGERPRINT
            const isEnrolled = await LocalAuth.isEnrolledAsync();
            setFingerprintSupported(hasFingerprint && isEnrolled);
            
            // Log fingerprint capability details
            console.log("Fingerprint hardware available:", hasHardware);
            console.log("Authentication types:", supportedTypes);
            console.log("Has fingerprints enrolled:", isEnrolled);
            console.log("Fingerprint authentication available:", hasFingerprint && isEnrolled);
          } else {
            console.log("Device does not have fingerprint hardware");
          }
        } else {
          console.log("LocalAuthentication module not available");
        }
      } catch (error) {
        console.log("Error checking fingerprint support:", error);
      }
    };
    
    checkFingerprintSupport();
  }, []);

  // Regular email/password login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your credentials.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
        role: selectedRole,
      });

      const { token, user_id, role, enable_fingerprint, user } = response.data;
      
      console.log("Login successful:", { 
        role, 
        user_id, 
        fingerprintEnabled: enable_fingerprint 
      });
      
      // If user has fingerprint enabled and this device supports it,
      // store the necessary information for future fingerprint login
      if (enable_fingerprint && fingerprintSupported) {
        // In a real app, you would store this information securely
        // For this example, we're just logging it
        console.log("User has fingerprint enabled. Would store credentials for future use.");
        console.log("Device ID for future reference:", deviceId);
      }

      // Redirect based on role
      if (role === "volunteer") {
        router.replace("/VolunteerDashboard");
      } else if (role === "practitioner") {
        router.replace("/NurseDashboard");
      } else if (role === "admin") {
        router.replace("/AdminDashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        // Server responded with an error
        Alert.alert("Login Failed", error.response.data.message || "Invalid credentials or server error.");
      } else if (error.request) {
        // Request was made but no response received
        Alert.alert("Connection Error", "Cannot connect to the server. Please try again later.");
      } else {
        // Something happened in setting up the request
        Alert.alert("Login Failed", "An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fingerprint login
  const handleFingerprintLogin = async () => {
    try {
      setLoading(true);
      
      // Import the LocalAuthentication module
      const LocalAuth = await import('expo-local-authentication').catch(() => null);
      
      if (!LocalAuth) {
        setLoading(false);
        Alert.alert("Error", "Fingerprint authentication is not available on this device.");
        return;
      }
      
      // Authenticate with fingerprint
      const result = await LocalAuth.authenticateAsync({
        promptMessage: 'Login with fingerprint',
        fallbackLabel: 'Use password instead',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        // If fingerprint verification succeeds, we need some way to identify the user to the server
        // Since we do not have AsyncStorage, we'll use the current email if provided
        if (!email) {
          setLoading(false);
          Alert.alert(
            "Email Required", 
            "Please enter your email address to use fingerprint login.",
            [{ text: "OK" }]
          );
          return;
        }
        
        try {
          // Send fingerprint authentication request to server
          const response = await axios.post(`${API_BASE_URL}/fingerprint-login`, {
            email: email,
            device_id: deviceId,
            role: selectedRole
          });
          
          const { token, user_id, role } = response.data;
          
          console.log("Fingerprint login successful:", { role, user_id });
          
          // Redirect based on role
          if (role === "volunteer") {
            router.replace("/VolunteerDashboard");
          } else if (role === "practitioner") {
            router.replace("/NurseDashboard");
          } else if (role === "admin") {
            router.replace("/AdminDashboard");
          }
        } catch (error) {
          console.error("Server verification failed:", error);
          
          if (error.response) {
            Alert.alert("Login Failed", error.response.data.message || "Server verification failed.");
          } else {
            Alert.alert("Login Failed", "Server verification failed. Please use email and password.");
          }
        }
      } else {
        Alert.alert(
          "Authentication Failed", 
          "Fingerprint verification failed or was cancelled."
        );
      }
    } catch (error) {
      console.error("Fingerprint login error:", error);
      Alert.alert("Login Failed", "Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Fingerprint Login Button - only shown if supported */}
            {fingerprintSupported && (
              <TouchableOpacity 
                style={styles.fingerprintButton} 
                onPress={handleFingerprintLogin}
              >
                <Text style={styles.fingerprintButtonText}>
                  Login with Fingerprint
                </Text>
              </TouchableOpacity>
            )}
          </>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9F7F3", // Base Color
  },
  formContainer: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    shadowColor: "#293241", // Dark blue for subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#3E7CB1", // Blue accent for emphasis
  },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DBE4EE", // Light blue border
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "white",
  },
  picker: {
    width: "100%",
    height: 200,
    color: "#293241", // Dark blue for text
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#98C1D9", // Lighter blue border
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: "#3E7CB1", // Blue primary button
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerLink: {
    marginTop: 18,
    alignItems: "center",
  },
  linkText: {
    color: "#98C1D9", // 
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },
  // Fingerprint specific styles
  fingerprintButton: {
    backgroundColor: "#4CAF50", // Green for fingerprint
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  fingerprintButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  }
});