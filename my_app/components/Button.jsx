import React from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { ThemedText } from "./ThemedText"

export const Button = ({ title, onPress, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <ThemedText style={styles.buttonText}>{title}</ThemedText>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

