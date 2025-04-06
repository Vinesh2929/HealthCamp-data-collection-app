import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
} from "react-native";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Button } from "../components/Button";
import { ThemedText } from "../components/ThemedText";
import { BackHandler } from "react-native";
// import { useNavigation } from "expo-router";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as Network from "expo-network";
import SpeechInput from "../components/SpeechInput";
const chrono = require('chrono-node');


// const PatientInfoPage1 = () => {
//   const navigation = useNavigation();

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       () => true
//     );
//     return () => backHandler.remove();
//   }, []);
const PatientInfoPage1 = () => {
  const router = useRouter(); // ✅ Use router instead of navigation
  const [serverIP, setServerIP] = useState(null);
  const { adharNumber } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [language, setLanguage] = useState('en-US'); // Default to English
  const [patientInfo, setPatientInfo] = useState({
    fname: "",
    lname: "",
    age: "",
    gender: "Male",
    address: "",
    village: "",
    date: "",
    worker_name: "",
    DOB: "",
    adhar_number: "",
    phone_num: "",
  });

  const formatDate = (isoDate) => {
    if (!isoDate) return ""; // Handle empty case
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  useEffect(() => {
    const fetchLocalIP = async () => {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        console.log("📡 Local Device IP:", ipAddress); // Debugging
        setServerIP(ipAddress);
      } catch (error) {
        Alert.alert("Error", "Failed to retrieve server IP.");
      }
    };
    fetchLocalIP();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back(); // ✅ Goes back to the previous page
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!serverIP || !adharNumber) return;

      try {
        const response = await axios.get(`http://${serverIP}:5001/get-patient-info/${adharNumber}`);

        if (response.status === 200) {
          setPatientInfo((prevState) => ({
            ...prevState,
            ...response.data,
            id: response.data.adhar_number ? String(response.data.adhar_number) : "",
            age: response.data.age ? String(response.data.age) : "",
            date: formatDate(response.data.date),
            DOB: formatDate(response.data.dob),
          }));
        }

        console.log(response.data);
      } catch (error) {
        console.error("Error fetching patient info", error);
        Alert.alert("Error", "Failed to fetch patient details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientDetails();
  }, [serverIP, adharNumber]);

  const updatePatientInfo = (field, value) => {
    setPatientInfo((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleNext = async () => {
    if (!serverIP) {
      Alert.alert("Error", "Server IP is not available. Please try again.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://${serverIP}:5001/station-1-patient-info`,
        patientInfo,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
  
      console.log("✅ Patient data saved:", response.data);
  
      Alert.alert("Success", "Patient data saved!");
    } catch (error) {
      console.error("❌ API Error:", error);
      Alert.alert("Error", "Failed to save patient data.");
    }
  };

  const handleSpeechResult = (field, value) => {
    console.log("🧠 handleSpeechResult triggered", field, value);
  
    let processedValue = value;
  
    if (['fname', 'lname', 'village'].includes(field)) {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
  
    if (field === 'date' || field === 'DOB') {
      try {
        const parsedDate = chrono.parseDate(value); // ✅ works now
  
        if (parsedDate) {
          const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(parsedDate.getDate()).padStart(2, '0');
          const yyyy = parsedDate.getFullYear();
          processedValue = `${mm}/${dd}/${yyyy}`;
          console.log(`📆 Chrono parsed: ${processedValue}`);
        } else {
          console.warn(`⚠️ Chrono could not parse: ${value}`);
        }
      } catch (err) {
        console.error("❌ Chrono error:", err);
      }
    }
  
    updatePatientInfo(field, processedValue);
  };
  

  const languages = [
    { label: 'English', value: 'en-US' },
    { label: 'Hindi', value: 'hi-IN' },
    { label: 'Tamil', value: 'ta-IN' },
    { label: 'Telugu', value: 'te-IN' },
    { label: 'Bengali', value: 'bn-IN' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* ✅ Back Button to Return to the Previous Page */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <ThemedText style={styles.header}>Patient Information</ThemedText>

          <View style={styles.section}>
            <View style={styles.inputWithVoice}>
              <Input
                label="First Name"
                value={patientInfo.fname}
                onChangeText={(text) => updatePatientInfo("fname", text)}
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say first name"
                language={language}
                fieldName="fname"
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="Last Name"
                value={patientInfo.lname}
                onChangeText={(text) => updatePatientInfo("lname", text)}
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say last name"
                language={language}
                fieldName="lname"
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="Age"
                value={patientInfo.age}
                onChangeText={(text) => updatePatientInfo("age", text)}
                keyboardType="numeric"
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say age"
                language={language}
                fieldName="age"
              />
            </View>

            <Dropdown
              label="Gender"
              options={["Male", "Female", "Other"]}
              selectedValue={patientInfo.gender}
              onValueChange={(value) => updatePatientInfo("gender", value)}
            />

            <View style={styles.inputWithVoice}>
              <Input
                label="Address"
                value={patientInfo.address}
                onChangeText={(text) => updatePatientInfo("address", text)}
                multiline
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say address"
                language={language}
                fieldName="address"
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="Village"
                value={patientInfo.village}
                onChangeText={(text) => updatePatientInfo("village", text)}
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say village"
                language={language}
                fieldName="village"
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="Date"
                value={patientInfo.date}
                onChangeText={(text) => updatePatientInfo("date", text)}
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say date"
                language={language}
                fieldName="date"
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="Worker Name"
                value={patientInfo.worker_name}
                onChangeText={(text) => updatePatientInfo("worker_name", text)}
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say worker name"
                language={language}
                fieldName="worker_name"
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="Date of Birth"
                value={patientInfo.DOB}
                onChangeText={(text) => updatePatientInfo("DOB", text)}
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say date of birth"
                language={language}
                fieldName="DOB"
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="ID (Aadhar Number)"
                value={patientInfo.adhar_number} // Changed from patientInfo.id
                onChangeText={(text) => updatePatientInfo("adhar_number", text)} // Make sure this is "adhar_number"
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say Aadhar number"
                language={language}
                fieldName="adhar_number" // Make sure this matches exactly
              />
            </View>

            <View style={styles.inputWithVoice}>
              <Input
                label="Phone Number"
                value={patientInfo.phone_num}
                onChangeText={(text) => updatePatientInfo("phone_num", text)}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <SpeechInput
                onSpeechResult={handleSpeechResult}
                placeholder="Say phone number"
                language={language}
                fieldName="phone_num"
              />
            </View>
          </View>

          <Button
            title="Submit"
            onPress={handleNext}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9F7F3",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#8f2d56",
  
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30, // Added bottom margin to avoid overlap
    alignSelf: "flex-start", // Ensures button stays aligned to the left
  },
  addButtonText: {
    marginLeft: 8,
    color: "#DBE4EE",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: "#E5CEDC",
  },
  checkboxGrid: {
    marginBottom: 16,
  },
  checkboxWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    width: "100%",
  },
  checkboxContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#E5CEDC",
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default PatientInfoPage1;
