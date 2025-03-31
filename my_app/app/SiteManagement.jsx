import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, StyleSheet } from "react-native";
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
                <Text style={styles.userEmail}>Email: {user.email}</Text>
                <View style={styles.roleContainer}>
                  <Text style={styles.roleHeader}>Roles:</Text>
                  <View style={styles.checkboxContainer}>
                    {["volunteer", "practitioner", "admin"].map((role) => (
                      <View key={role} style={styles.checkboxRow}>
                        <Switch
                          value={user[role] === 1}
                          onValueChange={() => toggleRole(user.user_id, role, user[role])}
                        />
                        <Text style={styles.roleText}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
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
    backgroundColor: "#F9F7F3",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DBE4EE",
    backgroundColor: "#F9F7F3",
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#293241",
  },
  searchBar: {
    flex: 1,
    marginLeft: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DBE4EE",
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: "#DBE4EE",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#3E7CB1",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#293241",
    marginBottom: 4,
  },
  userDetails: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userEmail: {
    fontSize: 16,
    color: "#3E7CB1",
    marginBottom: 10,
    fontWeight: "500",
  },
  userStatus: {
    fontSize: 14,
    color: "#293241",
    backgroundColor: "#98C1D9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 10,
    overflow: "hidden",
  },
  roleContainer: {
    marginTop: 14,
    backgroundColor: "#F9F7F3",
    padding: 12,
    borderRadius: 10,
  },
  roleHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#293241",
    borderBottomWidth: 1,
    borderBottomColor: "#E5CEDC",
    paddingBottom: 6,
  },
  checkboxContainer: {
    flexDirection: "column",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  checkboxRowActive: {
    backgroundColor: "rgba(229, 206, 220, 0.2)", // Light pink background for active rows
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#3E7CB1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: "#3E7CB1",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  roleText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#293241",
  },
  saveButton: {
    backgroundColor: "#3E7CB1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#DBE4EE",
    marginVertical: 10,
  },
  lastActivity: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F9F7F3",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#DBE4EE",
  },
  filterButtonActive: {
    backgroundColor: "#3E7CB1",
  },
  filterText: {
    color: "#293241",
    fontSize: 14,
  },
  filterTextActive: {
    color: "white",
    fontWeight: "500",
  },
  noResults: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default SiteManagement;
