import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Network from "expo-network";
import DateTimePicker from '@react-native-community/datetimepicker';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentHistoryModal from '../components/AppointmentHistoryModal';
import axios from "axios";
import RescheduleModal from '../components/RescheduleModal';

// Mock icons (in a real app, you'd use a library like @expo/vector-icons)
const SearchIcon = () => (
  <Text style={{ fontSize: 18, color: '#999' }}>🔍</Text>
);
const UserIcon = ({ gender }) => {
  switch (gender?.toLowerCase()) {
    case "male":
      return <Text style={{ fontSize: 18, color: '#007bff' }}>👨</Text>; // Male icon
    case "female":
      return <Text style={{ fontSize: 18, color: '#ff69b4' }}>👩</Text>; // Female icon
    default:
      return <Text style={{ fontSize: 18, color: '#999' }}>⚧️</Text>; // Gender-neutral icon
  }
};
const HeartIcon = () => (
  <Text style={{ fontSize: 18, color: '#999' }}>❤️</Text>
);

const ClockIcon = () => (
  <Text style={{ fontSize: 18, color: '#999' }}>🕒</Text>
);

const MedicalIcon = () => (
  <Text style={{ fontSize: 18, color: '#999' }}>🩺</Text>
);

const NurseDashboard = () => {
  const [adharNumber, setAdharNumber] = useState('');
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [createAppointmentModalVisible, setCreateAppointmentModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverIP, setServerIP] = useState(null);
  const router = useRouter();
  const [patientID, setPatientID] = useState(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);


  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentReason, setAppointmentReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [creatingAppointment, setCreatingAppointment] = useState(false);

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setAppointmentDate(selectedDate);
      
      // Only close the picker automatically on Android, keep it open on iOS
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    }
  };

  useEffect(() => {
    const fetchLocalIP = async () => {
      try {
        const ipAddress = await Network.getIpAddressAsync();
        setServerIP(ipAddress);
      } catch (error) {
        Alert.alert("Error", "Failed to retrieve server IP.");
      }
    };
    fetchLocalIP();
  }, []);

  const handleSearch = async () => {
    if (!adharNumber) {
      alert("Please enter an Aadhar number.");
      return;
    }
    if (!serverIP) {
      alert("Server IP not found. Please try again.");
      return;
    }

    setLoading(true);
    setPatientInfo(null);
    setAppointment(null);
    setAppointmentHistory([]);

    try {
      const response = await fetch(`http://${serverIP}:5001/lookup-patient-nurse/${adharNumber}`);
  
      if (!response.ok) {
        throw new Error("Patient not found.");
      }
  
      const data = await response.json();
      
      setPatientInfo({
        name: `${data.fname} ${data.lname}`,
        gender: data.gender,
        age: data.age,
        address: data.address,
        village: data.village,
        phoneNumber: data.phone_num,
        adharNumber: adharNumber,
        dob: data.dob,
        appointmentDate: 'N/A',
        history: data.medicalHistory
      });

      await fetchPatientID();
  
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientID = async () => {
    if (!serverIP || !adharNumber) {
      Alert.alert("Error", "Server IP or Aadhar Number is missing.");
      return;
    }
  
    try {
      const response = await axios.get(`http://${serverIP}:5001/get-patient-id/${adharNumber}`);
  
      if (response.status === 200 && response.data.patient_id) {
        console.log("✅ Patient ID Retrieved:", response.data.patient_id);
        const patientId = response.data.patient_id;
        setPatientID(patientId);
        
        // Now fetch upcoming appointments with this ID
        await fetchUpcomingAppointments(patientId);
        
        return patientId;
      } else {
        console.warn("❌ No patient found or invalid response.");
        Alert.alert("Error", "No patient found.");
      }
    } catch (error) {
      console.error("❌ Error fetching patient ID:", error);
      Alert.alert("Error", "Failed to retrieve patient ID.");
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    if (!appointmentData.reason.trim()) {
      alert("Please enter a reason for the appointment.");
      return;
    }
    
    if (!serverIP || !patientInfo) {
      alert("Server connection or patient information is missing.");
      return;
    }
    
    setCreatingAppointment(true);
    
    try {
      // Format date for API
      const formattedDate = appointmentData.appointmentDateTime.toISOString();
      
      const apiData = {
        patient_id: patientID, 
        appointment_date: formattedDate,
        reason: appointmentData.reason,
        status: 'Scheduled'
      };
      
      // Close the modal BEFORE making the API call
      setCreateAppointmentModalVisible(false);
      
      // Make the actual API call
      const response = await fetch(`http://${serverIP}:5001/appointments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }
      
      const data = await response.json();
      
      // Format the appointment date for display
      if (data.appointment && data.appointment.appointment_date) {
        const appointmentDate = new Date(data.appointment.appointment_date);
        const formattedDateTime = appointmentDate.toLocaleDateString() + " at " + 
          appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        data.appointment.formattedDate = formattedDateTime;
        
        // Update the appointment state with the new appointment
        setAppointment(data.appointment);
        
        // Also update the appointment date in patientInfo
        setPatientInfo(prevInfo => {
          if (prevInfo) {
            return {
              ...prevInfo,
              appointmentDate: formattedDateTime
            };
          }
          return prevInfo;
        });
      }
      
      // Update the appointment state with the new appointment
      setAppointment(data.appointment);
      
      // Reset other fields
      setAppointmentReason('');
      setAppointmentNotes('');
      
      // Show success message
      alert("Appointment created successfully!");
      
    } catch (error) {
      alert(error.message);
    } finally {
      setCreatingAppointment(false);
    }
  };

  const fetchUpcomingAppointments = async (id) => {
    if (!serverIP || !id) {
      console.warn("Cannot fetch upcoming appointments: Missing server IP or patient ID");
      return;
    }
    
    try {
      console.log(`Fetching upcoming appointments from: http://${serverIP}:5001/appointments/next/${id}`);
      
      const response = await fetch(`http://${serverIP}:5001/appointments/next/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch upcoming appointments: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Upcoming appointment data:", data);
      
      // Check if data is an array and has items
      if (Array.isArray(data) && data.length > 0) {
        // Get the first appointment (nearest upcoming)
        const nextAppointment = data[0];
        
        // Format the date for display
        const appointmentDate = new Date(nextAppointment.appointment_date);
        nextAppointment.formattedDate = appointmentDate.toLocaleDateString() + " at " + 
          appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        setAppointment(nextAppointment);
        
        // Update the patientInfo with the next appointment date
        setPatientInfo(prevInfo => {
          if (prevInfo) {
            return {
              ...prevInfo,
              appointmentDate: nextAppointment.formattedDate
            };
          }
          return prevInfo;
        });
      } 
      // Check if it's a single appointment object
      else if (data && data.appointment_date) {
        // Format the date for display
        const appointmentDate = new Date(data.appointment_date);
        data.formattedDate = appointmentDate.toLocaleDateString() + " at " + 
          appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        setAppointment(data);
      } 
      // If it's just a message with no appointments
      else {
        setAppointment(null);
      }
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      setAppointment(null);
    }
  };

  const handleRescheduleAppointment = async (updatedAppointmentData) => {
    if (!updatedAppointmentData.reason.trim()) {
      alert("Please enter a reason for the appointment.");
      return;
    }
    
    if (!serverIP || !patientInfo) {
      alert("Server connection or patient information is missing.");
      return;
    }
    
    setCreatingAppointment(true);
    
    try {
      // Format date for API
      const formattedDate = updatedAppointmentData.appointmentDateTime.toISOString();
      
      const apiData = {
        appointment_id: updatedAppointmentData.appointmentId,
        appointment_date: formattedDate,
        reason: updatedAppointmentData.reason,
      };
      
      // Close the modal BEFORE making the API call
      setRescheduleModalVisible(false);
      
      // Make the actual API call
      const response = await fetch(`http://${serverIP}:5001/appointments/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }
      
      const data = await response.json();
      
      // Format the appointment date for display
      if (data.appointment && data.appointment.appointment_date) {
        const appointmentDate = new Date(data.appointment.appointment_date);
        const formattedDateTime = appointmentDate.toLocaleDateString() + " at " + 
          appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        data.appointment.formattedDate = formattedDateTime;
        
        // Update the appointment state with the updated appointment
        setAppointment(data.appointment);
        
        // Also update the appointment date in patientInfo
        setPatientInfo(prevInfo => {
          if (prevInfo) {
            return {
              ...prevInfo,
              appointmentDate: formattedDateTime
            };
          }
          return prevInfo;
        });
      }
      
      // Update the appointment state with the updated appointment
      setAppointment(data.appointment);
      
      // Show success message
      alert("Appointment rescheduled successfully!");
      
    } catch (error) {
      alert(error.message);
    } finally {
      setCreatingAppointment(false);
    }
  };

  const TabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleContainer}>
                  <UserIcon gender={patientInfo.gender}/>
                  <Text style={styles.cardHeaderTitle}>Patient Details</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Full Name:</Text>
                  <Text style={styles.infoValue}>{patientInfo.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>{patientInfo.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{patientInfo.age} years</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>{patientInfo.address}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Village:</Text>
                  <Text style={styles.infoValue}>{patientInfo.village}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>{patientInfo.phoneNumber}</Text>
                </View>
              </View>
            </View>
  
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleContainer}>
                  <MedicalIcon />
                  <Text style={styles.cardHeaderTitle}>Doctor Notes</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Add notes about the patient's condition..."
                  value={notes}
                  onChangeText={setNotes}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.buttonText}>Save Notes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      case 'history':
        return patientInfo?.history ? <HistoryTab history={patientInfo.history} /> : <Text>No history available.</Text>;
      
      case 'diagnosis':
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>Diagnosis Information</Text>
              </View>
              <View style={styles.cardContent}>
                {patientInfo.diagnoses ? patientInfo.diagnoses.map((diagnosis, index) => (
                  <View key={index} style={styles.diagnosisItem}>
                    <Text style={styles.diagnosisCondition}>{diagnosis.condition}</Text>
                    <Text style={styles.diagnosisDate}>{diagnosis.date}</Text>
                  </View>
                )) : (
                  <Text style={styles.noDataText}>No diagnosis information available.</Text>
                )}
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.buttonText}>Add New Diagnosis</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
        case 'appointments':
          return (
            <AppointmentsTab
              appointment={appointment}
              patientID={patientID}
              serverIP={serverIP}
              patientInfo={patientInfo}
              createAppointmentModalVisible={createAppointmentModalVisible}
              setCreateAppointmentModalVisible={setCreateAppointmentModalVisible}
              historyModalVisible={historyModalVisible}
              setHistoryModalVisible={setHistoryModalVisible}
              rescheduleModalVisible={rescheduleModalVisible}
              setRescheduleModalVisible={setRescheduleModalVisible}
              handleCreateAppointment={handleCreateAppointment}
              handleRescheduleAppointment={handleRescheduleAppointment}
              loading={loading}
            />
          );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.searchCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nurse Dashboard</Text>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <SearchIcon />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Aadhar Number"
                keyboardType="numeric"
                value={adharNumber}
                onChangeText={setAdharNumber}
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {patientInfo && (
          <View style={styles.patientContainer}>
            <View style={styles.patientHeader}>
              <View style={styles.patientInfo}>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Patient Name</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.name}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Aadhar Number</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.adharNumber}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Gender</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.gender}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Date of Birth</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.dob}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Age</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.age}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Appointment Date</Text>
                    <Text style={styles.appointmentDateValue}>
                      {patientInfo.appointmentDate?.split(' at ')[0]}
                    </Text>
                    <Text style={styles.appointmentTimeValue}>
                      {patientInfo.appointmentDate?.includes(' at ') ? patientInfo.appointmentDate.split(' at ')[1] : ''}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.patientImageContainer}>
                <View style={styles.patientImage}>
                  <UserIcon gender={patientInfo.gender}/>
                </View>
              </View>
            </View>

            <View style={styles.tabsContainer}>
              <View style={styles.tabsHeader}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    selectedTab === 'overview' && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab('overview')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      selectedTab === 'overview' && styles.activeTabButtonText,
                    ]}
                  >
                    Overview
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    selectedTab === 'history' && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab('history')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      selectedTab === 'history' && styles.activeTabButtonText,
                    ]}
                  >
                    History
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    selectedTab === 'diagnosis' && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab('diagnosis')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      selectedTab === 'diagnosis' && styles.activeTabButtonText,
                    ]}
                  >
                    Diagnosis
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton, 
                    selectedTab === 'appointments' && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab('appointments')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      selectedTab === 'appointments' && styles.activeTabButtonText,
                    ]}
                  >
                    Appointments
                  </Text>
                </TouchableOpacity>
              </View>
              <TabContent />
            </View>
          </View>
        )}
        
        {/* Add a back button to return to volunteer dashboard */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/volunteerDashboard')}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const AppointmentsTab = ({ 
  appointment, 
  patientID, 
  serverIP, 
  patientInfo, 
  createAppointmentModalVisible,
  setCreateAppointmentModalVisible, 
  historyModalVisible, 
  setHistoryModalVisible,
  rescheduleModalVisible,
  setRescheduleModalVisible,
  handleCreateAppointment,
  handleRescheduleAppointment,
  loading 
}) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderTitleContainer}>
            <ClockIcon />
            <Text style={styles.cardHeaderTitle}>Appointment Management</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          {appointment ? (
            <View style={styles.appointmentInfoContainer}>
              <View style={styles.appointmentStatusBadge}>
                <Text style={styles.appointmentStatusText}>Upcoming</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentDate}>
                  {appointment.formattedDate || new Date(appointment.appointment_date).toLocaleString()}
                </Text>
                {appointment.reason && (
                  <Text style={styles.appointmentReason}>
                    Reason: {appointment.reason}
                  </Text>
                )}
                {appointment.notes && (
                  <Text style={styles.appointmentNotes}>
                    Notes: {appointment.notes}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noAppointmentContainer}>
              <Text style={styles.noAppointmentText}>No upcoming appointments</Text>
            </View>
          )}

          <View style={styles.appointmentButtonsContainer}>
            {appointment ? (
              <TouchableOpacity 
                style={styles.appointmentActionButton}
                onPress={() => setRescheduleModalVisible(true)}
              >
                <Text style={styles.buttonText}>Reschedule</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.appointmentActionButton} 
                onPress={() => setCreateAppointmentModalVisible(true)}
              >
                <Text style={styles.buttonText}>Create Appointment</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.appointmentActionButton, styles.historyButton]} 
              onPress={() => setHistoryModalVisible(true)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <AppointmentHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        patientID={patientID}
        serverIP={serverIP}
      />

      <AppointmentModal
        visible={createAppointmentModalVisible}
        onClose={() => setCreateAppointmentModalVisible(false)}
        onSubmit={handleCreateAppointment}
        patientName={patientInfo?.name}
      />
      
      <RescheduleModal
        visible={rescheduleModalVisible}
        onClose={() => setRescheduleModalVisible(false)}
        onSubmit={handleRescheduleAppointment}
        patientName={patientInfo?.name}
        appointment={appointment}
      />
    </View>
  );
};

const HistoryTab = ({ history }) => {
  if (!history) {
    return <Text style={styles.noDataText}>No history available for this patient.</Text>;
  }

  const { ophthalmologyHistory, systemicHistory, allergyHistory, contactLensesHistory, surgicalHistory } = history;

  // Helper function to render history sections dynamically
  const renderHistorySection = (title, icon, data) => {
    if (!data) return null; // ✅ Prevents errors for missing data
    const filteredEntries = Object.entries(data).filter(
      ([key, value]) =>
        value &&
        key !== "id" &&
        key !== "patient_id" &&
        key !== "created_at"
    );
    if (filteredEntries.length === 0) return null; // ✅ Skip empty sections
    
    return (
      <View style={styles.card} key={title}>
        <View style={styles.cardHeader}>
          {icon}
          <Text style={styles.cardHeaderTitle}>{title}</Text>
        </View>
        <View style={styles.cardContent}>
          {filteredEntries.map(([key, value]) => (
            <View key={key} style={styles.historyItem}>
              <Text style={styles.historyLabel}>{key.replace(/_/g, " ")}</Text>
              <Text style={styles.historyValue}>{value ? "✔️" : "❌"}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.historyContainer}>
      {renderHistorySection("Ophthalmology History", <Text>👁️</Text>, ophthalmologyHistory)}
      {renderHistorySection("Systemic History", <Text>🩸</Text>, systemicHistory)}
      {renderHistorySection("Allergy History", <Text>🤧</Text>, allergyHistory)}
      {renderHistorySection("Contact Lenses History", <Text>👓</Text>, contactLensesHistory)}
      {renderHistorySection("Eye Surgical History", <Text>🏥</Text>, surgicalHistory)}
    </ScrollView>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollView: {
    flex: 1,
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  patientContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  patientHeader: {
    backgroundColor: '#3b82f6',
    padding: 16,
    flexDirection: 'row',
  },
  patientInfo: {
    flex: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoItemLabel: {
    color: '#bbd2fa',
    fontSize: 12,
  },
  infoItemValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientImageContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#5e96ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flex: 1,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6',
  },
  tabButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 12.5,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  activeTabButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: '500',
  },
  appointmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentLabel: {
    color: '#666',
    fontSize: 12,
  },
  appointmentValue: {
    fontWeight: '500',
    fontSize: 16,
  },
  rescheduleButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  notesInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyEvent: {
    fontWeight: '600',
  },
  historyDate: {
    color: '#666',
  },
  historyNotes: {
    color: '#666',
  },
  diagnosisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  diagnosisCondition: {
    fontWeight: '500',
  },
  diagnosisDate: {
    color: '#666',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  checkmarkContainer: {
    marginRight: 12,
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontWeight: '500',
    color: '#4caf50',
  },
  medicationDetails: {
    color: '#666',
    fontSize: 12,
  },
  medicationDuration: {
    color: '#666',
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  historyContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cardContent: {
    paddingVertical: 5,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyLabel: {
    fontSize: 16,
    color: "#555",
  },
  historyValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  // Appointment section styles
  appointmentInfoContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  appointmentStatusBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  appointmentStatusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  appointmentDetails: {
    marginTop: 6,
  },
  appointmentDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appointmentReason: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  appointmentNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noAppointmentContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  noAppointmentText: {
    color: '#666',
    fontSize: 16,
  },
  appointmentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appointmentActionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  historyButton: {
    backgroundColor: '#5e96ff',
  },
  
  // Updated modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center", // This centers vertically
    alignItems: "center",     // This centers horizontally
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    maxHeight: "70%", // Reduced from 80% to ensure it stays centered
  },
  modalContent: {
    width: "100%", // Ensure content takes full width of container
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center', // Center the title
  },
  modalCloseButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 15,
    width: '50%',
    alignSelf: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#3b82f6',
  },
  
  // ... include all existing styles from your original code
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollView: {
    flex: 1,
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appointmentDateValue: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
appointmentTimeValue: {
  color: '#e0f2ff', // Slightly lighter than white
  fontSize: 15,
  fontWeight: '600',
},
});

export default NurseDashboard;
