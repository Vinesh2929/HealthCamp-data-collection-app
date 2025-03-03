import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/Button";
import { Dropdown } from "../components/Dropdown";
import { LineChart } from "react-native-chart-kit";
import { Menu } from "lucide-react-native";

// Screen width for responsive layout
const screenWidth = Dimensions.get("window").width;

const AdminDashboard = () => {
  const router = useRouter(); // Initialize router
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState("Last 7 Days");

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Menu size={30} color="#333" />
        </TouchableOpacity>
        <ThemedText style={styles.header}>Admin Dashboard</ThemedText>
      </View>

      {/* Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button 
              title="Authorization" 
              style={styles.menuButton} 
              onPress={() => {
                setMenuVisible(false);
                router.push("/AdminAuthorization"); 
              }} 
            />
            <Button title="Site Management" style={styles.menuButton} />
            <Button 
              title="Back to Login" 
              style={styles.menuButton}
              onPress={() => {
                setMenuVisible(false); // Closes modal
                router.push("/login"); // Navigates to login
              }} 
            />
            <Button 
              title="Data" 
              style={styles.menuButton} 
              onPress={() => {
                setMenuVisible(false); // Closes modal
                router.push("/PatientProgress"); // Navigates to patient info
              }}
            />
            <Button 
              title="Close" 
              onPress={() => setMenuVisible(false)} 
              style={styles.menuButton} 
            />
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          {/* Stats Boxes */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statTitle}>Total Patients</ThemedText>
              <ThemedText style={styles.statValue}>1,230</ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statTitle}>Total Staff</ThemedText>
              <ThemedText style={styles.statValue}>35</ThemedText>
            </View>
          </View>

          {/* Graph Section */}
          <View style={styles.graphContainer}>
            <Dropdown
              label="Select Trend"
              options={["Last 7 Days", "Last 30 Days", "Last Year"]}
              selectedValue={selectedTrend}
              onValueChange={setSelectedTrend}
            />
            <ThemedText style={styles.graphTitle}>Village Trend</ThemedText>
            <LineChart
              data={{
                labels: [
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ],
                datasets: [
                  {
                    data: [50, 80, 20, 60, 90, 30, 40, 70, 50, 85, 60, 95],
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(255, 69, 0, ${opacity})`,
                  },
                  {
                    data: [30, 60, 50, 70, 40, 100, 55, 75, 35, 65, 45, 85],
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
                  },
                ],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundGradientFrom: "#D8E2DC",
                backgroundGradientTo: "#EDEDE9",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForLabels: { fontSize: 12 },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDE9" },
  navbar: { flexDirection: "row", alignItems: "center", padding: 15 },
  header: { fontSize: 22, fontWeight: "bold", marginLeft: 15 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  menuButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#D5BDAF",
    borderRadius: 8,
  },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20 },
  mainContent: { flex: 1, paddingVertical: 20 },
  statsContainer: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 20 },
  statBox: {
    backgroundColor: "#F5EBE0",
    padding: 20,
    borderRadius: 12,
    shadowOpacity: 0.1,
    width: 150,
    marginRight: 15,
  },
  statTitle: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#D5BDAF", textAlign: "center" },
  graphContainer: { backgroundColor: "#D8E2DC", padding: 15, borderRadius: 12 },
  graphTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  chart: { borderRadius: 8 },
});

export default AdminDashboard;

