import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Network from "expo-network";
import axios from "axios";
import { Button, Card } from "react-native-paper";

// 📌 Fetch and Store API URL
const getServerIP = async (setServerIP, setLoading) => {
  try {
    const ipAddress = await Network.getIpAddressAsync();
    console.log("📡 Local IP Address:", ipAddress);
    setServerIP(ipAddress);
  } catch (error) {
    console.error("❌ Error fetching local IP:", error);
    Alert.alert("Error", "Failed to retrieve server IP.");
  } finally {
    setLoading(false);
  }
};

const VisionTest = () => {
  const [serverIP, setServerIP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [snellenInput, setSnellenInput] = useState("");
  const [snellenResults, setSnellenResults] = useState([]);

  const [visionTestData, setVisionTestData] = useState({
    sphere: "",
    cylinder: "",
    axis: "",
    pd: "",
    notes: "",
    staffId: "",
  });
  const [selectedEye, setSelectedEye] = useState("right");

  useEffect(() => {
    getServerIP(setServerIP, setLoading);
  }, []);

  const handleSubmitVisionTest = async () => {
    if (!serverIP) {
      Alert.alert("Error", "Server IP not available. Please try again.");
      return;
    }

    try {
      const response = await axios.post(
        `http://${serverIP}:5001/vision-test-results`,
        { ...visionTestData, eye: selectedEye },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("✅ API Response:", response.data);
      Alert.alert("Success", "Vision test results saved successfully!");
    } catch (error) {
      console.error("❌ Error submitting vision test:", error);
      Alert.alert("Error", "Failed to submit vision test. Please try again.");
    }
  };
  const snellenLetters = [
    { letters: "PTOC", size: 32, ratio: "20/63" },
    { letters: "ZLPED", size: 28, ratio: "20/50" },
    { letters: "ETODCF", size: 24, ratio: "20/40" },
    { letters: "DPCZLFT", size: 20, ratio: "20/32" },
    { letters: "LDCZOTEP", size: 16, ratio: "20/20" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Vision Test</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 0 ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={{ color: activeTab === 0 ? "white" : "black" }}>
            Snellen Chart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 1 ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={{ color: activeTab === 1 ? "white" : "black" }}>
            Autorefractor
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === 0 && (
        <Card style={styles.card}>
          <Text style={styles.title}>Vision Test</Text>
          {snellenLetters.map((row, index) => (
            <View key={index} style={styles.letterRow}>
              <Text style={{ fontSize: 14, color: "#666" }}>{row.ratio}</Text>
              <Text style={{ fontSize: row.size, fontWeight: "bold" }}>
                {row.letters}
              </Text>
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder={`Enter ${snellenLetters[0].letters.length} letters`}
            value={snellenInput}
            onChangeText={setSnellenInput}
          />
          <Button mode="contained" style={styles.button}>
            Submit Row
          </Button>
        </Card>
      )}

      {/* Autorefractor Test */}
      {activeTab === 1 && (
        <Card style={styles.card}>
          <Text style={styles.title}>Autorefractor Test</Text>

          {/* Eye Selection */}
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <TouchableOpacity
              style={[
                styles.eyeButton,
                selectedEye === "right" && styles.activeEye,
              ]}
              onPress={() => setSelectedEye("right")}
            >
              <Text
                style={{ color: selectedEye === "right" ? "white" : "#3b82f6" }}
              >
                Right Eye
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.eyeButton,
                selectedEye === "left" && styles.activeEye,
              ]}
              onPress={() => setSelectedEye("left")}
            >
              <Text
                style={{ color: selectedEye === "left" ? "white" : "#3b82f6" }}
              >
                Left Eye
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <TextInput
            style={styles.input}
            placeholder="Sphere (±0.00)"
            value={visionTestData.sphere}
            onChangeText={(text) =>
              setVisionTestData({ ...visionTestData, sphere: text })
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Cylinder (±0.00)"
            value={visionTestData.cylinder}
            onChangeText={(text) =>
              setVisionTestData({ ...visionTestData, cylinder: text })
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Axis (0-180)"
            value={visionTestData.axis}
            onChangeText={(text) =>
              setVisionTestData({ ...visionTestData, axis: text })
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="PD (mm)"
            value={visionTestData.pd}
            onChangeText={(text) =>
              setVisionTestData({ ...visionTestData, pd: text })
            }
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Notes"
            value={visionTestData.notes}
            onChangeText={(text) =>
              setVisionTestData({ ...visionTestData, notes: text })
            }
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Staff ID"
            value={visionTestData.staffId}
            onChangeText={(text) =>
              setVisionTestData({ ...visionTestData, staffId: text })
            }
          />

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <Button
              mode="contained"
              style={{ flex: 1, marginRight: 8 }}
              onPress={handleSubmitVisionTest}
              loading={loading}
              disabled={loading}
            >
              Save
            </Button>
            <Button
              mode="outlined"
              style={{ flex: 1 }}
              onPress={() =>
                setVisionTestData({
                  sphere: "",
                  cylinder: "",
                  axis: "",
                  pd: "",
                  notes: "",
                  staffId: "",
                })
              }
              disabled={loading}
            >
              Reset
            </Button>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f4f8" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  tabContainer: { flexDirection: "row", marginBottom: 16 },
  tabButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: { backgroundColor: "#3b82f6" },
  inactiveTab: { backgroundColor: "#e2e8f0" },
  card: { margin: 8, padding: 16, borderRadius: 8 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "white",
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
  },
  eyeButton: {
    flex: 1,
    padding: 16,
    margin: 4,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  activeEye: { backgroundColor: "#3b82f6" },
});

export default VisionTest;
