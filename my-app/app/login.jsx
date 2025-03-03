import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Picker,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import styled from "styled-components/native";

// Styled Components for CSS
const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 20px;
`;

const FormContainer = styled.View`
  padding: 20px;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  align-self: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
`;

const Input = styled.TextInput`
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding-horizontal: 16px;
  margin-bottom: 16px;
  font-size: 16px;
  background-color: white;
`;

const Select = styled(Picker)`
  height: 50px;
  margin-bottom: 16px;
  background-color: white;
`;

const Button = styled.TouchableOpacity`
  background-color: #2196f3;
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  margin-top: 8px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

const RegisterLink = styled.TouchableOpacity`
  margin-top: 16px;
  align-items: center;
`;

const LinkText = styled.Text`
  color: #2196f3;
  font-size: 14px;
`;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("volunteer"); // Default role
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your credentials.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post("http://localhost:5001/login", {
        email,
        password,
        role: selectedRole,
      });
  
      const { user_id, token } = response.data;
  
      // Redirect based on role
      if (selectedRole === "volunteer") {
        router.replace("/VolunteerDashboard");
      } else if (selectedRole === "practitioner") {
        router.replace("/NurseDashboard");
      } else if (selectedRole === "admin") {
        router.replace("/AdminDashboard");
      }
    } catch (error) {
      Alert.alert("Login Failed", "Invalid credentials or server error.");
    }
  
    setLoading(false);
  };
  

  return (
    <Container>
      <FormContainer>
        <Title>Login</Title>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Role Selection Dropdown */}
        <Select
          selectedValue={selectedRole}
          onValueChange={(itemValue) => setSelectedRole(itemValue)}
        >
          <Picker.Item label="Volunteer" value="volunteer" />
          <Picker.Item label="Practitioner" value="practitioner" />
          <Picker.Item label="Admin" value="admin" />
        </Select>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <Button onPress={handleLogin}>
            <ButtonText>Login</ButtonText>
          </Button>
        )}

        <RegisterLink onPress={() => router.push("/register")}>
          <LinkText>New user? Register here</LinkText>
        </RegisterLink>
      </FormContainer>
    </Container>
  );
}