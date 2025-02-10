// import React, { useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity
// } from 'react-native';
// import { router } from 'expo-router';

// export default function LoginScreen() {
//   const [badgeNumber, setBadgeNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const hardcodedUser = {
//     badgeNumber: '12345', // Replace with your test badge number
//     password: 'password123' // Replace with your test password
//   };

//   const handleLogin = async () => {
//     if (!badgeNumber || !password) {
//       setError('Please fill in all fields');
//       return;
//     }

//     // Check if the entered credentials match the hardcoded values
//     if (badgeNumber === hardcodedUser.badgeNumber && password === hardcodedUser.password) {
//       console.log('Login successful!');// Navigate to HomeScreen after login
//       router.replace('/patientInfoPage1');
//     } else {
//       setError('Invalid credentials');
//     }
//   };

//   const handleRegisterPress = () => {
//     router.push('/register'); // Navigate to the Register screen
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.formContainer}>
//         <Text style={styles.title}>Healthcare Worker Login</Text>

//         {error ? (
//           <Text style={styles.error}>{error}</Text>
//         ) : null}

//         <TextInput
//           style={styles.input}
//           placeholder="Badge Number"
//           value={badgeNumber}
//           onChangeText={setBadgeNumber}
//           keyboardType="number-pad"
//           autoCapitalize="none"
//         />

//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           autoCapitalize="none"
//         />

//         <TouchableOpacity
//           style={styles.button}
//           onPress={handleLogin}
//         >
//           <Text style={styles.buttonText}>Login</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.registerLink}
//           onPress={handleRegisterPress}
//         >
//           <Text style={styles.linkText}>New healthcare worker? Register here</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   formContainer: {
//     padding: 20,
//     borderRadius: 10,
//     width: '100%',
//     maxWidth: 400,
//     alignSelf: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   input: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     marginBottom: 16,
//     fontSize: 16,
//     backgroundColor: 'white',
//   },
//   button: {
//     backgroundColor: '#2196F3',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   error: {
//     color: '#ff3333',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   registerLink: {
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   linkText: {
//     color: '#2196F3',
//     fontSize: 14,
//   }
// });
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [emailOrId, setEmailOrId] = useState(""); // Nurse ID or Email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔹 Hardcoded Users (Replace with API Calls Later)
  const hardcodedUsers = [
    { nurse_id: "12345", password: "password123", role: "nurse" },
    {
      email: "volunteer@testing.com",
      password: "password123",
      role: "volunteer",
    },
  ];

  const handleLogin = () => {
    if (!emailOrId || !password) {
      Alert.alert("Error", "Please enter your credentials.");
      return;
    }

    setLoading(true);

    let foundUser = null;

    // 🔹 Check if input is a Nurse ID (numeric) or an email
    if (/^\d+$/.test(emailOrId)) {
      // Look for a nurse (by ID)
      foundUser = hardcodedUsers.find(
        (user) => user.nurse_id === emailOrId && user.password === password
      );
    } else {
      // Look for a volunteer (by email)
      foundUser = hardcodedUsers.find(
        (user) => user.email === emailOrId && user.password === password
      );
    }

    if (foundUser) {
      // 🔹 Redirect user based on role
      if (foundUser.role === "volunteer") {
        router.replace("/VolunteerDashboard");
      } else if (foundUser.role === "nurse") {
        router.replace("/NurseDashboard");
      } else {
        Alert.alert("Error", "Unknown role assigned.");
      }
    } else {
      Alert.alert("Login Failed", "Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Nurse ID or Email"
          value={emailOrId}
          onChangeText={setEmailOrId}
          keyboardType="default"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "white",
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
  },
});
