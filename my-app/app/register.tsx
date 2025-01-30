import React, { useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView 
} from 'react-native';
import { Link } from 'expo-router';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    badgeNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (Object.values(formData).some(value => !value)) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // TODO: Implement actual registration logic here
      console.log('Registration attempted with:', formData);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Healthcare Worker Registration</Text>
          
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Badge Number"
            value={formData.badgeNumber}
            onChangeText={(value) => updateFormData('badgeNumber', value)}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={styles.button}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginLink}>
              <Text style={styles.linkText}>Already registered? Login here</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff3333',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2196F3',
    fontSize: 14,
  }
});