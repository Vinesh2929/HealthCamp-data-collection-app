import React from "react"
import { View, StyleSheet } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { ThemedText } from "./ThemedText"

export const Dropdown = ({ label, options, selectedValue, onValueChange }) => (
  <View style={styles.container}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <View style={styles.pickerContainer}>
      <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
        {options.map((option) => (
          <Picker.Item key={option} label={option} value={option} />
        ))}
      </Picker>
    </View>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
  },
  picker: {
    color: "#000",
  },
})
