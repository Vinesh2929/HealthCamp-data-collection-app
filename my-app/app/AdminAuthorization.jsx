import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Button, Card } from "react-native-paper";

const AdminAuthorization = () => {
  // Hardcoded pending users for now
  const [pendingUsers, setPendingUsers] = useState([
    { id: 1, first_name: "Alice", last_name: "Johnson", role: "Practitioner" },
    { id: 2, first_name: "Bob", last_name: "Smith", role: "Volunteer" },
    { id: 3, first_name: "Charlie", last_name: "Brown", role: "Practitioner" },
  ]);

  // Approve user
  const handleApprove = (userId) => {
    setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    console.log(`✅ Approved user ID: ${userId}`);
  };

  // Deny user
  const handleDeny = (userId) => {
    setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    console.log(`❌ Denied user ID: ${userId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Authorization</Text>
      
      {pendingUsers.length === 0 ? (
        <Text style={styles.noUsers}>No pending approvals.</Text>
      ) : (
        pendingUsers.map((user) => (
          <Card key={user.id} style={styles.card}>
            <Text style={styles.userText}>{user.role}: {user.first_name} {user.last_name}</Text>
            <View style={styles.buttonContainer}>
              <Button mode="contained" style={styles.approveButton} onPress={() => handleApprove(user.id)}>Approve</Button>
              <Button mode="outlined" style={styles.denyButton} onPress={() => handleDeny(user.id)}>Deny</Button>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f4f8" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 16 },
  noUsers: { textAlign: "center", marginTop: 20, fontSize: 16, color: "gray" },
  card: { margin: 8, padding: 16, borderRadius: 8, backgroundColor: "#fff", elevation: 3 },
  userText: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  approveButton: { flex: 1, marginRight: 8, backgroundColor: "#4CAF50" },
  denyButton: { flex: 1, borderColor: "#D32F2F", color: "#D32F2F" }
});

export default AdminAuthorization;