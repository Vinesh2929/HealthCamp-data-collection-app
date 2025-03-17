
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import LogoutButton from './LogoutButton';

// Mock icons (in a real app, you'd use a library like @expo/vector-icons)
const SearchIcon = () => (
  <Text style={{ fontSize: 18, color: '#999' }}>🔍</Text>
);

const UserIcon = () => (
  <Text style={{ fontSize: 18, color: '#999' }}>👤</Text>
);

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
  const [selectedTab, setSelectedTab] = useState('overview');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Mock patient data - in a real app, this would come from your API
  const mockPatientData = {
    name: 'Sarah Smith',
    gender: 'Female',
    age: 24,
    bloodGroup: 'B+',
    appointmentDate: '31.10.2020',
    height: '165 cm',
    weight: '58 kg',
    pressure: '120/80',
    phoneNumber: '+91 9876543210',
    adharNumber: '123456789012',
    village: 'Greenwood',
    medications: [
      { name: 'Simvastatin', dose: '5 mg', instruction: 'Take 1 with food', duration: '2 Months' },
      { name: 'Loratadine', dose: '10 mg', instruction: 'Take 1 with food', duration: '3 Weeks' },
      { name: 'Montelukast', dose: '10 mg', instruction: 'Take 1 with food', duration: '3 Weeks' }
    ],
    diagnoses: [
      { condition: 'Allergic Rhinitis', date: '14.05.2020' },
      { condition: 'Mild Hypercholesterolemia', date: '14.05.2020' }
    ],
    history: [
      { event: 'Initial Consultation', date: '14.05.2020', notes: 'Patient presented with seasonal allergies and high cholesterol.' },
      { event: 'Follow-up Appointment', date: '31.10.2020', notes: 'Patient shows improvement in allergy symptoms.' }
    ]
  };

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would fetch this data from your backend
      if (adharNumber.length > 0) {
        setPatientInfo(mockPatientData);
      } else {
        setPatientInfo(null);
      }
      setLoading(false);
    }, 800);
  };

  const TabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleContainer}>
                  <UserIcon />
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
                  <Text style={styles.infoLabel}>Blood Group:</Text>
                  <Text style={styles.infoValue}>{patientInfo.bloodGroup}</Text>
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
                  <HeartIcon />
                  <Text style={styles.cardHeaderTitle}>Vital Signs</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height:</Text>
                  <Text style={styles.infoValue}>{patientInfo.height}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight:</Text>
                  <Text style={styles.infoValue}>{patientInfo.weight}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Blood Pressure:</Text>
                  <Text style={styles.infoValue}>{patientInfo.pressure}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderTitleContainer}>
                  <ClockIcon />
                  <Text style={styles.cardHeaderTitle}>Next Appointment</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.appointmentContainer}>
                  <View>
                    <Text style={styles.appointmentLabel}>Date</Text>
                    <Text style={styles.appointmentValue}>{patientInfo.appointmentDate}</Text>
                  </View>
                  <TouchableOpacity style={styles.rescheduleButton}>
                    <Text style={styles.buttonText}>Reschedule</Text>
                  </TouchableOpacity>
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
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>Medical History</Text>
              </View>
              <View style={styles.cardContent}>
                {patientInfo.history.map((item, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyEvent}>{item.event}</Text>
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.historyNotes}>{item.notes}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      case 'diagnosis':
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>Diagnosis Information</Text>
              </View>
              <View style={styles.cardContent}>
                {patientInfo.diagnoses.map((diagnosis, index) => (
                  <View key={index} style={styles.diagnosisItem}>
                    <Text style={styles.diagnosisCondition}>{diagnosis.condition}</Text>
                    <Text style={styles.diagnosisDate}>{diagnosis.date}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.buttonText}>Add New Diagnosis</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 'medicine':
        return (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>Medications</Text>
              </View>
              <View style={styles.cardContent}>
                {patientInfo.medications.map((medication, index) => (
                  <View key={index} style={styles.medicationItem}>
                    <View style={styles.checkmarkContainer}>
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    </View>
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>{medication.name}</Text>
                      <Text style={styles.medicationDetails}>
                        {medication.dose}, {medication.instruction}
                      </Text>
                    </View>
                    <Text style={styles.medicationDuration}>{medication.duration}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.buttonText}>Prescribe New Medication</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
                    <Text style={styles.infoItemLabel}>Gender</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.gender}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Age</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.age}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Blood Group</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.bloodGroup}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Appointment Date</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.appointmentDate}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoItemLabel}>Aadhar Number</Text>
                    <Text style={styles.infoItemValue}>{patientInfo.adharNumber}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.patientImageContainer}>
                <View style={styles.patientImage}>
                  <UserIcon />
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
                    styles.tabButton, selectedTab === 'medicine' && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab('medicine')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      selectedTab === 'medicine' && styles.activeTabButtonText,
                    ]}
                  >
                    Medicine
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
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6',
  },
  tabButtonText: {
    color: '#666',
    fontWeight: '500',
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
});

export default NurseDashboard;
