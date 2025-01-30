import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/app/HomeScreen'; // Import the HomeScreen
import PatientInfoPage from '@/app/PatientInfoPage'; // Import the PatientInfoPage
import Login from '@/app/login'; // Import the Login screen
import Register from '@/app/register'; // Import the Register screen

const Stack = createNativeStackNavigator(); // Create the stack navigator

export default function RootLayout() {
  return (
    
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login" // This is the route name for the login screen
          component={Login}
          options={{ headerShown: true }} // Show a header for the login screen
        />
        <Stack.Screen
          name="Home" // This is the route name for the home screen
          component={HomeScreen}
          options={{ headerShown: true }} // Show a header for the home screen
        />
        <Stack.Screen
          name="PatientInfo" // This is the route name for the patient info page
          component={PatientInfoPage}
          options={{ headerShown: true }} // Show a header for the patient info page
        />
        <Stack.Screen
          name="Register" // This is the route name for the register screen
          component={Register}
          options={{ headerShown: true }} // Show a header for the register screen
        />
      </Stack.Navigator>
    
  );
}