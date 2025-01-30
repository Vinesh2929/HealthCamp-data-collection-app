import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  // Use the navigation prop
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to the App</Text>
      <Button
        title="Go to Patient Info"
        onPress={() => navigation.navigate('PatientInfo')} // Navigate to the PatientInfo screen
      />
    </View>
  );
}