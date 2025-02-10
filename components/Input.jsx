import React from "react"
import { View, TextInput, StyleSheet } from "react-native"
import { ThemedText } from "./ThemedText"

export const Input = ({ label, ...props }) => (
  <View style={styles.container}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
  </View>
)

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    color: "#000",
  },
})


