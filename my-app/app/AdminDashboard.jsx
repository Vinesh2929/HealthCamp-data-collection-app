import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/Button";
import { Dropdown } from "../components/Dropdown";
import { LineChart } from "react-native-chart-kit";
import { ChevronRight, ChevronLeft } from "lucide-react-native";

//screen width for responsive layout
const screenWidth = Dimensions.get("window").width;

const AdminDashboard = () => {
  //sidebar open or closed
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //tracks the selected trend filter for the graph
  const [selectedTrend, setSelectedTrend] = useState("Last 7 Days");

  return (
    <View style={styles.container}>
      {/*sidebar*/}
      <View
        style={[
          styles.sidebar,
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed,
        ]}
      >
        {sidebarOpen ? (
          <ScrollView contentContainerStyle={styles.sidebarContent}>
            {/*close sidebar*/}
            <TouchableOpacity
              onPress={() => setSidebarOpen(false)}
              style={styles.menuButton}
            >
              <ChevronLeft size={24} color="#333" />
            </TouchableOpacity>
            {/*sidebar buttons*/}
            <Button title="Authorization" style={styles.sidebarButton} />
            <Button title="Site Management" style={styles.sidebarButton} />
            <Button title="Home" style={styles.sidebarButton} />
            <Button title="Data" style={styles.sidebarButton} />
          </ScrollView>
        ) : (
          /*open sidebar button*/
          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={styles.menuButton}
          >
            <ChevronRight size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      {/*main content*/}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          {/*page header*/}
          <ThemedText style={styles.header}>Admin Dashboard</ThemedText>

          {/*stats boxes*/}
          <View style={styles.statsContainer}>
            {/*total patients box*/}
            <View style={styles.statBox}>
              <ThemedText style={styles.statTitle}>Total Patients</ThemedText>
              <ThemedText style={styles.statValue}>1,230</ThemedText>
            </View>
            {/*total staff box*/}
            <View style={styles.statBox}>
              <ThemedText style={styles.statTitle}>Total Staff</ThemedText>
              <ThemedText style={styles.statValue}>35</ThemedText>
            </View>
          </View>

          {/* graph section*/}
          <View style={styles.graphContainer}>
            {/*dropdown to select trend*/}
            <Dropdown
              label="Select Trend"
              options={["Last 7 Days", "Last 30 Days", "Last Year"]}
              selectedValue={selectedTrend}
              onValueChange={setSelectedTrend}
            />
            {/*graph title*/}
            <ThemedText style={styles.graphTitle}>Village Trend</ThemedText>
            {/* line chart graph*/}
            <LineChart
              data={{
                labels: [
                  "Jan",
                  "  Feb",
                  "   Mar",
                  " Apr",
                  "May",
                  "  Jun",
                  "   Jul",
                  " Aug",
                  "Sep",
                  "  Oct",
                  "   Nov",
                  "Dec",
                ],
                datasets: [
                  {
                    data: [50, 80, 20, 60, 90, 30, 40, 70, 50, 85, 60, 95],
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(255, 69, 0, ${opacity})`,
                  }, //first dataset, red line
                  {
                    data: [30, 60, 50, 70, 40, 100, 55, 75, 35, 65, 45, 85],
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
                  }, //second dataset, green line
                ],
              }}
              width={screenWidth - 100}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundGradientFrom: "#D8E2DC", //light green background for graph
                backgroundGradientTo: "#EDEDE9", // light gray
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, //black text
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // black labels
                propsForLabels: {
                  fontSize: 12,
                },
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

//styles for the UI Elements
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#EDEDE9", //light green background
  },
  sidebar: {
    width: 250,
    backgroundColor: "#D6CCC2", //sidebar background beige
    paddingVertical: 10,
  },
  sidebarOpen: {
    width: 250,
    backgroundColor: "#D6CCC2", //sidebar background beige
  },
  sidebarClosed: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D6CCC2", //sidebar background beige
  },
  sidebarContent: {
    padding: 10,
  },
  menuButton: {
    padding: 10,
    backgroundColor: "#D5BDAF", //sidebar toggle pink brown
    borderRadius: 8,
  },
  sidebarButton: {
    marginVertical: 5,
    backgroundColor: "#D5BDAF", //sidebar navigation pink brown
    padding: 10,
    borderRadius: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
    color: "#333", //dark gray header
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#F5EBE0", //stats boxes light beige
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    width: 150,
    marginRight: 15,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333", //dark grey titles
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#D5BDAF", //brown pink for stats numbers
    textAlign: "center",
  },
  graphContainer: {
    marginTop: 20,
    backgroundColor: "#D8E2DC", //graph container background light green
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: "flex-start",
    paddingHorizontal: 10,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
    color: "#333", //dark gray title for graphs
  },
  chart: {
    borderRadius: 8,
    padding: 10,
  },
});

export default AdminDashboard;
