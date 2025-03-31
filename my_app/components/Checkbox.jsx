import React from "react"
import { TouchableOpacity, View, StyleSheet } from "react-native"
import { ThemedText } from "./ThemedText"
import { Check } from "lucide-react-native"

export const Checkbox = ({ label, checked, onCheck }) => (
  <TouchableOpacity style={styles.container} onPress={() => onCheck(!checked)}>
    <View style={[styles.checkbox, checked && styles.checked]}>{checked && <Check size={16} color="#fff" />}</View>
    <ThemedText style={styles.label}>{label}</ThemedText>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  label: {
    fontSize: 16,
  },
})