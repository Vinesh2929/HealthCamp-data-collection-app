import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "App" }}
      />
      <Stack.Screen
        name="register"
        options={{ headerShown: true, title: "Register" }}
      />
      <Stack.Screen
        name="login"
        options={{ headerShown: true, title: "Login" }}
      />
      <Stack.Screen
        name="AdminDashboard"
        options={{ headerShown: true, title: "Admin Dashboard" }}
      />
      <Stack.Screen
        name="PatientInfoPage"
        options={{
          headerShown: false,
          title: "Patient Info",
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="VolunteerDashboard"
        options={{ headerShown: true, title: "Volunteer Dashboard" }}
      />

      <Stack.Screen
        name="NurseDashboard"
        options={{ headerShown: true, title: "Nurse Dashboard" }}
      />
      <Stack.Screen
        name="PatientLookup"
        options={{ headerShown: true, title: "Patient Lookup" }}
      />
      <Stack.Screen
        name="PatientProgress"
        options={{ headerShown: true, title: "Patient Progress" }}
      />
      <Stack.Screen
        name="MedicalHistory"
        options={{ headerShown: true, title: "Medical History" }}
      />
      <Stack.Screen
        name="VisionTest"
        options={{ headerShown: true, title: "Vision Test" }}
      />
      <Stack.Screen
        name="NursePatientLookup"
        options={{ headerShown: true, title: "Nurse Patient Lookup" }}
      />
       <Stack.Screen
        name="NursePatientProgeress"
        options={{ headerShown: true, title: "Nurse Patient Progress" }}
      />
    </Stack>
  );
}
