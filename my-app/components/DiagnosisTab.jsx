import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';

const DiagnosisTab = ({ patientInfo, patientID, serverIP }) => {
  const [diagnoses, setDiagnoses] = useState(patientInfo?.diagnoses || []);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [diagnosisCondition, setDiagnosisCondition] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (patientID && serverIP) {
      fetchAppointments();
      fetchDiagnoses();
    }
  }, [patientID, serverIP]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://${serverIP}:5001/appointments/all/${patientID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      // Format appointment dates for display
      const formattedAppointments = data.map(apt => {
        const date = new Date(apt.appointment_date);
        return {
          ...apt,
          formattedDate: date.toLocaleDateString() + " at " + 
            date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
      });
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Alert.alert("Error", "Failed to load appointments");
    }
  };

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${serverIP}:5001/diagnoses/${patientID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch diagnoses");
      }
      const data = await response.json();
      setDiagnoses(data);
    } catch (error) {
      console.error("Error fetching diagnoses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiagnosis = async () => {
    if (!diagnosisCondition.trim()) {
      Alert.alert("Error", "Please enter a diagnosis condition");
      return;
    }
    
    if (!selectedAppointmentId) {
      Alert.alert("Error", "Please select an appointment");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://${serverIP}:5001/diagnoses/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientID,
          appointment_id: selectedAppointmentId,
          condition: diagnosisCondition,
          notes: diagnosisNotes,
          date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add diagnosis");
      }

      // Refresh diagnoses list
      await fetchDiagnoses();
      
      // Reset form and close modal
      setDiagnosisCondition('');
      setDiagnosisNotes('');
      setSelectedAppointmentId(null);
      setAddModalVisible(false);
      
      Alert.alert("Success", "Diagnosis added successfully");
    } catch (error) {
      console.error("Error adding diagnosis:", error);
      Alert.alert("Error", "Failed to add diagnosis");
    } finally {
      setLoading(false);
    }
  };

  const AddDiagnosisModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addModalVisible}
      onRequestClose={() => setAddModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Diagnosis</Text>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Select Appointment:</Text>
              <ScrollView style={styles.appointmentSelector} nestedScrollEnabled={true}>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <TouchableOpacity
                      key={apt.appointment_id}
                      style={[
                        styles.appointmentOption,
                        selectedAppointmentId === apt.appointment_id && styles.selectedAppointment
                      ]}
                      onPress={() => setSelectedAppointmentId(apt.appointment_id)}
                    >
                      <Text style={styles.appointmentOptionText}>{apt.formattedDate}</Text>
                      <Text style={styles.appointmentReasonText}>{apt.reason}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noAppointmentsText}>No appointments available</Text>
                )}
              </ScrollView>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Diagnosis Condition:</Text>
              <TextInput
                style={styles.formInput}
                value={diagnosisCondition}
                onChangeText={setDiagnosisCondition}
                placeholder="Enter diagnosis condition"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Doctor Notes:</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                multiline
                numberOfLines={4}
                value={diagnosisNotes}
                onChangeText={setDiagnosisNotes}
                placeholder="Add notes about the diagnosis..."
              />
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleAddDiagnosis}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Diagnosis</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>Diagnosis Information</Text>
        </View>
        <View style={styles.cardContent}>
          {loading ? (
            <ActivityIndicator color="#3b82f6" size="large" style={styles.loader} />
          ) : diagnoses && diagnoses.length > 0 ? (
            diagnoses.map((diagnosis, index) => (
              <View key={index} style={styles.diagnosisItem}>
                <View style={styles.diagnosisHeader}>
                  <Text style={styles.diagnosisCondition}>{diagnosis.condition}</Text>
                  <Text style={styles.diagnosisDate}>{new Date(diagnosis.date).toLocaleDateString()}</Text>
                </View>
                {diagnosis.notes && (
                  <View style={styles.diagnosisNotes}>
                    <Text style={styles.notesLabel}>Doctor Notes:</Text>
                    <Text style={styles.notesContent}>{diagnosis.notes}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No diagnosis information available.</Text>
          )}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={styles.buttonText}>Add New Diagnosis</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <AddDiagnosisModal />
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#f8f9ff',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  loader: {
    marginVertical: 20,
  },
  diagnosisItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  diagnosisCondition: {
    fontWeight: '600',
    fontSize: 16,
    color: '#3b82f6',
  },
  diagnosisDate: {
    color: '#666',
    fontSize: 14,
  },
  diagnosisNotes: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  notesLabel: {
    fontWeight: '500',
    marginBottom: 4,
    color: '#555',
  },
  notesContent: {
    color: '#333',
    fontStyle: 'italic',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalContent: {
    width: '100%',
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  appointmentSelector: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  appointmentOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedAppointment: {
    backgroundColor: '#e6f0ff',
  },
  appointmentOptionText: {
    fontWeight: '500',
  },
  appointmentReasonText: {
    fontSize: 12,
    color: '#666',
  },
  noAppointmentsText: {
    padding: 10,
    textAlign: 'center',
    color: '#999',
  },
});

export default DiagnosisTab;