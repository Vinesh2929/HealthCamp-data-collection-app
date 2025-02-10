import { Stack } from 'expo-router';

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
        name="PatientInfoPage"
        options={{
          headerShown: false,
          title: "Patient Info",
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}