import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Button, Card } from "react-native-paper";
import axios from "axios";

const AdminAuthorization = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users who need authorization (role value = 0.5)
  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5001/pending-users");
      setPendingUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Approve user by updating their role to 1
  const handleApprove = async (userId, role) => {
    try {
      await axios.put(`http://localhost:5001/approve-user/${userId}/${role}`);
      setPendingUsers(pendingUsers.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error("❌ Error approving user:", error);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Authorization</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : pendingUsers.length === 0 ? (
        <Text style={styles.noUsers}>No pending approvals.</Text>
      ) : (
        pendingUsers.map((user) => (
          <Card key={user.user_id} style={styles.card}>
            <Text style={styles.userText}>
              {user.role}: {user.first_name} {user.last_name}
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={styles.approveButton}
                onPress={() => handleApprove(user.user_id, user.role)}
              >
                Approve
              </Button>
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
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  approveButton: { backgroundColor: "#4CAF50" }
});

export default AdminAuthorization;
