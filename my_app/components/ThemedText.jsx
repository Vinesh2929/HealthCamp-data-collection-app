import React from "react"
import { Text, StyleSheet } from "react-native"

export const ThemedText = ({ style, children, ...props }) => (
  <Text style={[styles.text, style]} {...props}>
    {children}
  </Text>
)

const styles = StyleSheet.create({
  text: {
    color: "#333",
  },
})

