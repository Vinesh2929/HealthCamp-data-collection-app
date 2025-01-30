import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/app/HomeScreen'; // Import the HomeScreen
import PatientInfoPage from '@/app/PatientInfoPage'; // Import the PatientInfoPage

const Stack = createNativeStackNavigator(); // Create the stack navigator

export default function RootLayout() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: true }} // Show a header for the home screen
      />
      <Stack.Screen
        name="PatientInfo" // This is the route name used in navigation.navigate
        component={PatientInfoPage}
        options={{ headerShown: true }} // Show a header for the PatientInfo page
      />
    </Stack.Navigator>
  );
}