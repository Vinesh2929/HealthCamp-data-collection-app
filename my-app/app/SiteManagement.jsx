import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, CheckBox, StyleSheet } from "react-native";
import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

const SiteManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const nursesRes = await axios.get(`${API_BASE_URL}/api/nurses`);
      const rolesRes = await axios.get(`${API_BASE_URL}/api/user-roles`);
      const mergedUsers = nursesRes.data.map((nurse) => {
        const roleData = rolesRes.data.find((role) => role.user_id === nurse.nurse_id) || {};
        return { ...nurse, ...roleData, user_id: nurse.nurse_id };
      });
      setUsers(mergedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleRole = async (userId, role, currentValue) => {
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      await axios.put(`${API_BASE_URL}/api/update-role/${userId}/${role}`, { value: newValue });
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.header}>Site Management</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView style={styles.scrollContainer}>
        {filteredUsers.map((user) => (
          <View key={user.user_id} style={styles.userCard}>
            <TouchableOpacity onPress={() => setExpandedUser(expandedUser === user.user_id ? null : user.user_id)}>
              <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
            </TouchableOpacity>
            {expandedUser === user.user_id && (
              <View style={styles.userDetails}>
                <Text>Email: {user.email}</Text>
                <View style={styles.roleContainer}>
                  <Text>Roles:</Text>
                  <View style={styles.checkboxContainer}>
                    {['volunteer', 'practitioner', 'admin'].map((role) => (
                      <View key={role} style={styles.checkboxRow}>
                        <CheckBox
                          value={user[role] === 1}
                          onValueChange={() => toggleRole(user.user_id, role, user[role])}
                        />
                        <Text>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDE9",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
  },
  searchBar: {
    flex: 1,
    marginLeft: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: "#F5EBE0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    marginTop: 10,
  },
  roleContainer: {
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SiteManagement;
