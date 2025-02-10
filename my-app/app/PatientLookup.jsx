// import React, { useState } from "react";
// import {
//   View,
//   TextInput,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";

// export default function PatientLookup() {
//   const [adharNumber, setAdharNumber] = useState("");
//   const [patientInfo, setPatientInfo] = useState(null);
//   const router = useRouter();

//   // 🔹 Hardcoded Patient Data (Replace with API Calls Later)
//   const hardcodedPatients = [
//     {
//       adhar_number: "123456789012",
//       fname: "John",
//       lname: "Doe",
//       age: 45,
//       gender: "Male",
//       village: "Greenwood",
//       phone_num: "9876543210",
//     },
//     {
//       adhar_number: "987654321098",
//       fname: "Jane",
//       lname: "Smith",
//       age: 38,
//       gender: "Female",
//       village: "Sunnyvale",
//       phone_num: "8765432109",
//     },
//     {
//       adhar_number: "555555555555",
//       fname: "Raj",
//       lname: "Kumar",
//       age: 50,
//       gender: "Male",
//       village: "Bluefield",
//       phone_num: "7654321098",
//     },
//   ];

//   const fetchPatientInfo = () => {
//     if (!adharNumber) {
//       Alert.alert("Error", "Please enter an Aadhar number.");
//       return;
//     }

//     // 🔹 Search for the patient in the hardcoded list
//     const foundPatient = hardcodedPatients.find(
//       (patient) => patient.adhar_number === adharNumber
//     );

//     if (foundPatient) {
//       setPatientInfo(foundPatient);
//     } else {
//       Alert.alert("Not Found", "No patient found with this Aadhar number.");
//       setPatientInfo(null);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Patient Lookup</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Enter Aadhar Number"
//         keyboardType="numeric"
//         value={adharNumber}
//         onChangeText={setAdharNumber}
//       />

//       <TouchableOpacity style={styles.button} onPress={fetchPatientInfo}>
//         <Text style={styles.buttonText}>Search Patient</Text>
//       </TouchableOpacity>

//       {patientInfo && (
//         <View style={styles.resultContainer}>
//           <Text style={styles.resultText}>
//             👤 {patientInfo.fname} {patientInfo.lname}
//           </Text>
//           <Text style={styles.resultText}>📅 Age: {patientInfo.age}</Text>
//           <Text style={styles.resultText}>🚻 Gender: {patientInfo.gender}</Text>
//           <Text style={styles.resultText}>
//             🏡 Village: {patientInfo.village}
//           </Text>
//           <Text style={styles.resultText}>
//             📞 Phone: {patientInfo.phone_num}
//           </Text>
//         </View>
//       )}

//       {/* ✅ Add Back Button to Volunteer Dashboard */}
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => router.replace("/volunteerDashboard")}
//       >
//         <Text style={styles.buttonText}>Back to Dashboard</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#f0f0f0",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 24,
//     color: "#007AFF",
//   },
//   input: {
//     width: "80%",
//     height: 50,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     marginBottom: 16,
//     fontSize: 16,
//     backgroundColor: "white",
//   },
//   button: {
//     backgroundColor: "#2196F3",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     width: "80%",
//     marginBottom: 10,
//   },
//   backButton: {
//     backgroundColor: "#FF3B30",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     width: "80%",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   resultContainer: {
//     marginTop: 24,
//     padding: 16,
//     borderRadius: 8,
//     backgroundColor: "white",
//     width: "80%",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   resultText: {
//     fontSize: 16,
//     marginBottom: 4,
//   },
// });
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function PatientLookup() {
  const [adharNumber, setAdharNumber] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);
  const router = useRouter();

  // 🔹 Hardcoded Patient Data (Replace with API Calls Later)
  const hardcodedPatients = [
    {
      adhar_number: "123456789012",
      fname: "John",
      lname: "Doe",
      age: 45,
      gender: "Male",
      village: "Greenwood",
      phone_num: "9876543210",
    },
    {
      adhar_number: "987654321098",
      fname: "Jane",
      lname: "Smith",
      age: 38,
      gender: "Female",
      village: "Sunnyvale",
      phone_num: "8765432109",
    },
    {
      adhar_number: "555555555555",
      fname: "Raj",
      lname: "Kumar",
      age: 50,
      gender: "Male",
      village: "Bluefield",
      phone_num: "7654321098",
    },
  ];

  const fetchPatientInfo = () => {
    if (!adharNumber) {
      Alert.alert("Error", "Please enter an Aadhar number.");
      return;
    }

    // 🔹 Search for the patient in the hardcoded list
    const foundPatient = hardcodedPatients.find(
      (patient) => patient.adhar_number === adharNumber
    );

    if (foundPatient) {
      setPatientInfo(foundPatient);
    } else {
      Alert.alert("Not Found", "No patient found with this Aadhar number.");
      setPatientInfo(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Lookup</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Aadhar Number"
        keyboardType="numeric"
        value={adharNumber}
        onChangeText={setAdharNumber}
      />

      <TouchableOpacity style={styles.button} onPress={fetchPatientInfo}>
        <Text style={styles.buttonText}>Search Patient</Text>
      </TouchableOpacity>

      {patientInfo && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            👤 {patientInfo.fname} {patientInfo.lname}
          </Text>
          <Text style={styles.resultText}>📅 Age: {patientInfo.age}</Text>
          <Text style={styles.resultText}>🚻 Gender: {patientInfo.gender}</Text>
          <Text style={styles.resultText}>
            🏡 Village: {patientInfo.village}
          </Text>
          <Text style={styles.resultText}>
            📞 Phone: {patientInfo.phone_num}
          </Text>

          {/* ✅ Add Button to Navigate to Patient Progress */}
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() =>
              router.push({
                pathname: "/PatientProgress",
                params: { adharNumber: patientInfo.adhar_number },
              })
            }
          >
            <Text style={styles.buttonText}>View Progress</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Add Back Button to Volunteer Dashboard */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/volunteerDashboard")}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#007AFF",
  },
  input: {
    width: "80%",
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
    width: "80%",
    marginBottom: 10,
  },
  progressButton: {
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "white",
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 4,
  },
});
