import { useState, useEffect } from "react"
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native"
import { Input } from "../components/Input"
import { Dropdown } from "../components/Dropdown"
import { Button } from "../components/Button"
import { ThemedText } from "../components/ThemedText"
import { BackHandler } from "react-native"
import { useNavigation } from "expo-router"
import axios from "axios"

const PatientInfoPage1 = () => {
  const navigation = useNavigation()

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true)
    return () => backHandler.remove()
  }, [])

  const [patientInfo, setPatientInfo] = useState({
    fname: "",
    lname: "",
    age: "",
    gender: "",
    address: "",
    village: "",
    date: "",
    worker_name: "",
    DOB: "",
    id: "",
    phone_num: "",
  })

  const updatePatientInfo = (field, value) => {
    setPatientInfo((prevState) => ({
      ...prevState,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://192.168.2.70:5000/add-patient", patientInfo)
      console.log("Success:", response.data)
      alert(`Patient information saved successfully! Patient ID: ${response.data.patient_id}`)
      navigation.navigate("PatientInfoPage") 
    } catch (error) {
      console.error("Error saving patient info:", error)
      alert("Failed to save patient information.")
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText style={styles.header}>Patient Information</ThemedText>

          <View style={styles.section}>
            <Input
              label="First Name"
              value={patientInfo.fname}
              onChangeText={(text) => updatePatientInfo("fname", text)}
            />
            <Input
              label="Last Name"
              value={patientInfo.lname}
              onChangeText={(text) => updatePatientInfo("lname", text)}
            />
            <Input
              label="Age"
              value={patientInfo.age}
              onChangeText={(text) => updatePatientInfo("age", text)}
              keyboardType="numeric"
            />
            <Dropdown
              label="Gender"
              options={["Male", "Female", "Other"]}
              selectedValue={patientInfo.gender}
              onValueChange={(value) => updatePatientInfo("gender", value)}
            />
            <Input
              label="Address"
              value={patientInfo.address}
              onChangeText={(text) => updatePatientInfo("address", text)}
              multiline
            />
            <Input
              label="Village"
              value={patientInfo.village}
              onChangeText={(text) => updatePatientInfo("village", text)}
            />

            <Input 
            label="Date" 
            value={patientInfo.date} 
            onChangeText={(text) => updatePatientInfo("date", text)} 
            />

            <Input
              label="Worker Name"
              value={patientInfo.worker_name}
              onChangeText={(text) => updatePatientInfo("worker_name", text)}
            />
            <Input
              label="Date of Birth"
              value={patientInfo.DOB}
              onChangeText={(text) => updatePatientInfo("DOB", text)}
            />
            <Input label="ID" value={patientInfo.id} onChangeText={(text) => updatePatientInfo("id", text)} />
            <Input
              label="Phone Number"
              value={patientInfo.phone_num}
              onChangeText={(text) => updatePatientInfo("phone_num", text)}
              keyboardType="phone-pad"
            />
          </View>

          <Button title="Submit" onPress={handleSubmit} style={styles.submitButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#f0f0f0",
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
      color: "#007AFF",
      textShadowColor: "rgba(0, 0, 0, 0.1)",
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
      color: "#007AFF",
      fontSize: 16,
    },
    submitButton: {
      marginTop: 24,
      marginBottom: 40,
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
  })

export default PatientInfoPage1

