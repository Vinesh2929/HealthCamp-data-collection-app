import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
`;

const FormContainer = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  background-color: #2196F3;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  margin-top: 10px;
  &:hover {
    background-color: #1976D2;
  }
`;

const Message = styled.p`
  color: ${(props) => (props.success ? "green" : "red")};
  margin-bottom: 15px;
`;

const LoginLink = styled(Link)`
  display: block;
  margin-top: 15px;
  color: #2196F3;
  text-decoration: none;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
  }
`;

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer", // Default role selection
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async () => {
    if (Object.values(formData).some((value) => !value)) {
      setMessage("Please fill in all fields.");
      setIsSuccess(false);
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }
  
    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
  
      // Register user
      const response = await axios.post("http://localhost:5001/register", userData);
      const userId = response.data.user_id;
  
      // Update role to 0.5 in the users table
      await axios.put(`http://localhost:5001/update-role-progress/${userId}/${formData.role}`);
  
      setMessage(`Registration successful! Your ${formData.role} role is now in progress.`);
      setIsSuccess(true);
    } catch (err) {
      setMessage("Registration failed. Please try again.");
      setIsSuccess(false);
    }
  };
  

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Container>
      <FormContainer>
        <Title>User Registration</Title>

        {message && <Message success={isSuccess}>{message}</Message>}

        <Input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => updateFormData("firstName", e.target.value)}
        />

        <Input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => updateFormData("lastName", e.target.value)}
        />

        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
        />

        <Input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => updateFormData("confirmPassword", e.target.value)}
        />

        {/* Role Dropdown */}
        <Select value={formData.role} onChange={(e) => updateFormData("role", e.target.value)}>
          <option value="volunteer">Volunteer</option>
          <option value="practitioner">Practitioner</option>
          <option value="admin">Admin</option>
        </Select>

        <Button onClick={handleRegister}>Register</Button>

        <LoginLink to="/login">Already registered? Login here</LoginLink>
      </FormContainer>
    </Container>
  );
}
