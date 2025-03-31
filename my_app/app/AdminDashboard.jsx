import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/Button";
import { LineChart } from "react-native-chart-kit";
import { Menu, ChevronDown } from "lucide-react-native";
import axios from "axios";

// Screen width for responsive layout
const screenWidth = Dimensions.get("window").width;

// API Base URL - Update this to your server address
// Use your computer's IP address when testing on a physical device
const API_URL = "http://localhost:5001"; // Change to your server URL

// Create some sample data for initial testing
const initialChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [4, 6, 8, 10, 12, 9],
      color: (opacity = 1) => `rgba(255, 69, 0, ${opacity})`, // Orange for Diabetes
      strokeWidth: 3
    }
  ],
  legend: ["Loading..."]
};

// Color mappings for different diseases
const diseaseColors = {
  "Diabetes": (opacity = 1) => `rgba(229, 206, 220, ${opacity})`, // #E5CEDC (Light Pink)
  "Hypertension": (opacity = 1) => `rgba(155, 114, 207, ${opacity})`, // #9B72CF (Purple)
  "Heart Disease": (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // #4169E1 (Blue - Kept)
  "Vision Problems": (opacity = 1) => `rgba(15, 163, 177, ${opacity})`, // #0FA3B1 (Teal)
  "Respiratory Issues": (opacity = 1) => `rgba(244, 211, 94, ${opacity})`, // #F4D35E (Yellow)
  "All Diseases": (opacity = 1) => `rgba(70, 70, 70, ${opacity})` // Gray (Kept)
};


const AdminDashboard = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last Year");
  const [selectedDisease, setSelectedDisease] = useState("All Diseases");
  const [diseaseDropdownVisible, setDiseaseDropdownVisible] = useState(false);
  
  // State for storing data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(initialChartData);
  const [fullData, setFullData] = useState(null);
  const [patientCount, setPatientCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [diseasePatientCount, setDiseasePatientCount] = useState(0);
  const [yAxisMax, setYAxisMax] = useState(20); // Dynamic y-axis maximum
  
  // Fixed timeframe options - use strings directly 
  const timeframeOptions = ["Last 7 Days", "Last 30 Days", "Last Year"];
  const timeframeValues = {
    "Last 7 Days": "week",
    "Last 30 Days": "month",
    "Last Year": "year"
  };

  // Available diseases - will be populated from API data
  const [availableDiseases, setAvailableDiseases] = useState([
    "All Diseases",
    "Diabetes", 
    "Hypertension", 
    "Heart Disease"
  ]);

  // Update chart data when disease selection changes
  const updateChartDataForSelectedDisease = () => {
    if (!fullData) return;
    
    // If "All Diseases" is selected, show all diseases
    if (selectedDisease === "All Diseases") {
      const allDiseasesData = {
        labels: fullData.labels,
        datasets: fullData.datasets.map((ds, index) => ({
          ...ds,
          strokeWidth: 2 // Thinner lines when showing all
        })),
        legend: fullData.legend
      };
      setChartData(allDiseasesData);
      
      // Set Y-axis max to largest value in any dataset plus a small buffer
      const allValues = fullData.datasets.flatMap(ds => ds.data);
      const maxValue = Math.max(...allValues);
      setYAxisMax(Math.ceil(maxValue * 1.2)); // 20% buffer
      
      // Count total unique patients with any disease
      setDiseasePatientCount(fullData.summary?.totalDiseasePatients || 0);
      return;
    }
    
    // Filter data for the selected disease
    const diseaseIndex = fullData.legend.indexOf(selectedDisease);
    if (diseaseIndex !== -1) {
      const filteredData = {
        labels: fullData.labels,
        datasets: [{
          data: fullData.datasets[diseaseIndex].data,
          color: diseaseColors[selectedDisease] || ((opacity = 1) => `rgba(128, 128, 128, ${opacity})`),
          strokeWidth: 4 // Thicker line for single disease view
        }],
        legend: [selectedDisease]
      };
      setChartData(filteredData);
      
      // Set Y-axis max to largest value in this dataset plus a small buffer
      const maxValue = Math.max(...fullData.datasets[diseaseIndex].data);
      setYAxisMax(Math.ceil(maxValue * 1.2)); // 20% buffer
      
      // Set disease-specific patient count
      const countKey = selectedDisease.toLowerCase().replace(' ', '_') + 'Patients';
      setDiseasePatientCount(fullData.summary?.[countKey] || 0);
    }
  };
  
  useEffect(() => {
    if (fullData) {
      updateChartDataForSelectedDisease();
    }
  }, [selectedDisease, fullData]);

  // Fetch data based on selected timeframe
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch patient count
      const patientResponse = await axios.get(`${API_URL}/patient-count`);
      setPatientCount(patientResponse.data.count);
      
      // Fetch staff count
      const staffResponse = await axios.get(`${API_URL}/staff-count`);
      setStaffCount(staffResponse.data.count);
      
      // Try to fetch disease trends, but use fallback if it fails
      try {
        const timeframeValue = timeframeValues[selectedTimeframe] || "year";
        const trendsResponse = await axios.get(`${API_URL}/disease-trends/${timeframeValue}`);
        
        // Process API data to fit chart format
        if (trendsResponse.data && trendsResponse.data.chartData) {
          const apiData = trendsResponse.data.chartData;
          
          // Format the labels for better readability
          const formattedLabels = apiData.labels.map(label => {
            if (timeframeValue === "week") {
              return label.split('-')[2]; // Just day of month
            } else if (timeframeValue === "month") {
              const date = new Date(label);
              return `${date.getMonth() + 1}/${date.getDate()}`; // MM/DD format
            } else {
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const month = parseInt(label.split('-')[1]) - 1;
              return monthNames[month]; // Month name
            }
          });
          
          // Convert to format expected by chart
          const processedData = {
            labels: formattedLabels,
            datasets: [],
            legend: [],
            summary: trendsResponse.data.summary // Store summary data
          };
          
          // Extract unique diseases
          const diseases = [...new Set(apiData.datasets.map(ds => ds.disease))];
          processedData.legend = diseases;
          setAvailableDiseases(["All Diseases", ...diseases]); // Update available diseases
          
          // Instead of percentages, use actual patient counts
          diseases.forEach(disease => {
            // Get raw count data for this disease across all villages
            const countsForDisease = apiData.rawCounts
              ? apiData.rawCounts.filter(item => item.disease === disease)
              : [];
            
            // If we have raw counts, use them
            if (countsForDisease.length > 0) {
              // Convert from object per time period to array of values
              const countData = formattedLabels.map(label => {
                const periodData = countsForDisease.find(item => 
                  item.period === label || item.formattedPeriod === label
                );
                return periodData ? periodData.count : 0;
              });
              
              processedData.datasets.push({
                data: countData,
                color: diseaseColors[disease] || ((opacity = 1) => `rgba(128, 128, 128, ${opacity})`),
                strokeWidth: 3
              });
            } else {
              // Fallback: Convert percentage data to approximate counts
              // This is just an approximation if the API doesn't provide raw counts
              const dataForDisease = apiData.datasets
                .filter(ds => ds.disease === disease)
                .map(ds => ds.data);
              
              // Use the total patient count to convert percentages to raw numbers
              const countData = [];
              if (dataForDisease.length > 0) {
                for (let i = 0; i < dataForDisease[0].length; i++) {
                  let totalForPeriod = patientResponse.data.count; // Use total patient count
                  let percentage = dataForDisease[0][i]; // Use first village's data
                  countData.push(Math.round((percentage / 100) * totalForPeriod));
                }
              }
              
              processedData.datasets.push({
                data: countData.length > 0 ? countData : [0, 0, 0, 0, 0, 0],
                color: diseaseColors[disease] || ((opacity = 1) => `rgba(128, 128, 128, ${opacity})`),
                strokeWidth: 3
              });
            }
          });
          
          // Find max value for y-axis scaling
          const allValues = processedData.datasets.flatMap(ds => ds.data);
          const maxValue = Math.max(...allValues);
          setYAxisMax(Math.ceil(maxValue * 1.2)); // Add 20% buffer
          
          // Store the full processed data
          setFullData(processedData);
          
          // Initial disease-specific data
          updateChartDataForSelectedDisease();
        }
      } catch (trendError) {
        console.error("Error fetching trends:", trendError);
        // Keep using the initial data if trends fetch fails
      }
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when component mounts or timeframe changes
  useEffect(() => {
    fetchData();
  }, [selectedTimeframe]);

  // Custom time period selector
  const TimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <ThemedText style={styles.selectorLabel}>Time Period</ThemedText>
      <View style={styles.buttonGroup}>
        {timeframeOptions.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.timeButton,
              selectedTimeframe === option ? styles.selectedTimeButton : null
            ]}
            onPress={() => setSelectedTimeframe(option)}
          >
            <ThemedText 
              style={[
                styles.timeButtonText,
                selectedTimeframe === option ? styles.selectedTimeButtonText : null
              ]}
            >
              {option}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Disease dropdown selector
  const DiseaseSelector = () => (
    <View style={styles.diseaseSelectorContainer}>
      <ThemedText style={styles.selectorLabel}>Disease</ThemedText>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDiseaseDropdownVisible(!diseaseDropdownVisible)}
      >
        <ThemedText style={styles.dropdownButtonText}>{selectedDisease}</ThemedText>
        <ChevronDown size={18} color="#333" />
      </TouchableOpacity>
      
      {/* Dropdown menu */}
      {diseaseDropdownVisible && (
        <View style={styles.dropdownMenu}>
          {availableDiseases.map(disease => (
            <TouchableOpacity
              key={disease}
              style={[
                styles.dropdownItem,
                selectedDisease === disease && styles.selectedDropdownItem
              ]}
              onPress={() => {
                setSelectedDisease(disease);
                setDiseaseDropdownVisible(false);
              }}
            >
              <View 
                style={[
                  styles.diseaseColorIndicator, 
                  { backgroundColor: diseaseColors[disease] ? diseaseColors[disease](1) : 'gray' }
                ]} 
              />
              <ThemedText 
                style={[
                  styles.dropdownItemText,
                  selectedDisease === disease && styles.selectedDropdownItemText
                ]}
              >
                {disease}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

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
            <Button 
              title="Site Management" 
              style={styles.menuButton} 
              onPress={() => {
                setMenuVisible(false);
                router.push("/SiteManagement"); 
              }} 
            />
            <Button 
              title="Back to Login" 
              style={styles.menuButton}
              onPress={() => {
                setMenuVisible(false);
                router.push("/login");
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        // Close the dropdown when scrolling
        onScroll={() => setDiseaseDropdownVisible(false)}
        scrollEventThrottle={16}
      >
        <View style={styles.mainContent}>
          {/* Stats Boxes */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statTitle}>Total Patients</ThemedText>
              {loading ? (
                <ActivityIndicator size="small" color="#D5BDAF" />
              ) : (
                <ThemedText style={styles.statValue}>{patientCount.toLocaleString()}</ThemedText>
              )}
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statTitle}>Total Staff</ThemedText>
              {loading ? (
                <ActivityIndicator size="small" color="#D5BDAF" />
              ) : (
                <ThemedText style={styles.statValue}>{staffCount.toLocaleString()}</ThemedText>
              )}
            </View>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <Button 
                title="Retry" 
                onPress={fetchData} 
                style={styles.retryButton} 
              />
            </View>
          )}

          {/* Graph Section */}
          <View style={styles.graphContainer}>
            {/* Time Period Selector */}
            <TimeframeSelector />
            
            {/* Disease Selector Dropdown */}
            <DiseaseSelector />
            
            {/* Disease-specific patient count */}
            {!loading && selectedDisease !== "All Diseases" && (
              <View style={styles.diseaseCountContainer}>
                <ThemedText style={styles.diseaseCountText}>
                  Current total: {diseasePatientCount} patients with {selectedDisease}
                </ThemedText>
              </View>
            )}
            
            <ThemedText style={styles.graphTitle}>Disease Cases Over Time</ThemedText>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D5BDAF" />
                <ThemedText style={styles.loadingText}>Loading data...</ThemedText>
              </View>
            ) : (
              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={250} // Increased height for better visibility
                chartConfig={{
                  backgroundColor: "#D8E2DC",
                  backgroundGradientFrom: "#D8E2DC",
                  backgroundGradientTo: "#EDEDE9",
                  decimalPlaces: 0, // No decimal places for cleaner look
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  propsForLabels: { 
                    fontSize: 12,
                    fontWeight: 'bold',
                  },
                  propsForDots: {
                    r: "6", // Larger dots
                    strokeWidth: "2",
                    stroke: "#fafafa",
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "6, 6", // Dashed lines
                    stroke: "#aaaaaa",
                  },
                }}
                bezier
                style={styles.chart}
                fromZero={true} // Start Y axis from 0
                yAxisLabel=""
                yAxisSuffix=" cases"
                withInnerLines={true}
                segments={5} // Show 5 segments for the y-axis
                formatYLabel={(value) => Math.round(value).toString()}
              />
            )}
            
            {/* Chart explanation */}
            <View style={styles.chartExplanation}>
              <ThemedText style={styles.explanationText}>
                Y-axis shows the number of patient cases
              </ThemedText>
            </View>
          </View>
          
          {/* Info Section */}
          <View style={styles.infoBox}>
            <ThemedText style={styles.infoTitle}>About Disease Trends</ThemedText>
            <ThemedText style={styles.infoText}>
              This chart shows the actual number of patients diagnosed with each condition over time.
              The total patient count ({patientCount}) represents all registered patients in the system.
              Select specific diseases from the dropdown to focus on individual conditions.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9F7F3" 
  },
  navbar: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DBE4EE" 
  },
  header: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginLeft: 15,
    color: "#293241"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(41, 50, 65, 0.5)", // #293241 with opacity
  },
  modalContent: {
    backgroundColor: "#F9F7F3",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: '80%',
  },
  menuButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#3E7CB1",
    borderRadius: 8,
    width: '100%',
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  mainContent: { 
    flex: 1, 
    paddingVertical: 20 
  },
  statsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 20 
  },
  statBox: {
    backgroundColor: "#DBE4EE",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    height: 100,
    justifyContent: 'center',
  },
  statTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    textAlign: "center",
    color: "#293241"
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#3E7CB1", 
    textAlign: "center", 
    marginTop: 8 
  },
  graphContainer: { 
    backgroundColor: "#98C1D9", 
    alignItems:'center',
    padding: 15, 
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  graphTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginVertical: 10, 
    textAlign: 'center',
    color: "#293241"
  },
  chart: { 
    borderRadius: 8, 
    marginVertical: 8 
  },
  chartExplanation: {
    alignItems: 'center',
    marginTop: 5,
  },
  explanationText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#293241',
  },
  timeframeContainer: { 
    marginBottom: 15,
    width:'100%' 
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#293241"
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#DBE4EE',
    borderRadius: 8,
    padding: 2,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedTimeButton: {
    backgroundColor: '#F9F7F3',
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 12,
    color: '#293241',
  },
  selectedTimeButtonText: {
    color: '#3E7CB1',
    fontWeight: 'bold',
  },
  diseaseSelectorContainer: {
    marginBottom: 15,
    zIndex: 2,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F7F3',
    borderRadius: 8,
    padding: 12,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: "#293241"
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#F9F7F3',
    borderRadius: 8,
    padding: 5,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  selectedDropdownItem: {
    backgroundColor: '#DBE4EE',
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#293241"
  },
  selectedDropdownItemText: {
    fontWeight: 'bold',
    color: "#3E7CB1"
  },
  diseaseColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  diseaseCountContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  diseaseCountText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#293241',
  },
  loadingContainer: { 
    height: 220, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#3E7CB1' 
  },
  errorContainer: {
    backgroundColor: '#E5CEDC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#293241',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3E7CB1',
    padding: 8,
    borderRadius: 5,
  },
  infoBox: {
    backgroundColor: "#E5CEDC",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#293241",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#293241"
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#293241",
  },
});

export default AdminDashboard;