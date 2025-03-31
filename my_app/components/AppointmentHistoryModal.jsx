import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

const AppointmentHistoryModal = ({ 
    visible, 
    onClose, 
    patientID,
    serverIP
  }) => {
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch appointment history when modal becomes visible
    if (visible && patientID && serverIP) {
      fetchAppointmentHistory();
    }
  }, [visible, patientID, serverIP]);

  const fetchAppointmentHistory = async () => {
    if (!serverIP || !patientID) {
      console.warn("Cannot fetch appointment history: Missing server IP or patient ID");
      return;
    }
    
    setLoading(true);
    
    try {      
      const response = await fetch(`http://${serverIP}:5001/appointments/history/${patientID}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointment history: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Make sure we're working with an array
      const historyArray = Array.isArray(data) ? data : [];
      
      // Process appointment status based on date
      const processedAppointments = historyArray.map(appt => {
        // Create a copy of the appointment
        const processedAppt = {...appt};
        
        const now = new Date();
        const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Convert to UTC
        
        // Now add IST offset (UTC+5:30)
        const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const nowIST = new Date(utcTime.getTime() + istOffset);
        
        // Parse appointment date
        const appointmentDate = new Date(appt.appointment_date);
        
        // Override status if appointment is scheduled but in the past
        if (processedAppt.status === 'Scheduled' && appointmentDate < nowIST) {
          processedAppt.status = 'Completed';
        }
        
        return processedAppt;
      });
      
      // Sort appointments by date (newest first)
      processedAppointments.sort((a, b) => 
        new Date(b.appointment_date) - new Date(a.appointment_date)
      );
      
      setAppointmentHistory(processedAppointments);
    } catch (error) {
      console.error("Error fetching appointment history:", error);
      setAppointmentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to safely format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString() + " at " + 
        date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return '#4caf50'; // Green
      case 'Cancelled':
        return '#f44336'; // Red
      case 'Scheduled':
        return '#ff9800'; // Orange
      default:
        return '#ff9800'; // Default to orange
    }
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Appointment History</Text>
          
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalContent}>
              {appointmentHistory && appointmentHistory.length > 0 ? (
                appointmentHistory.map((appt, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemDate}>
                        {formatDate(appt.appointment_date)}
                      </Text>
                      <View style={[
                        styles.historyItemStatusBadge,
                        { backgroundColor: getStatusColor(appt.status) }
                      ]}>
                        <Text style={styles.historyItemStatusText}>{appt.status || 'Scheduled'}</Text>
                      </View>
                    </View>
                    <Text style={styles.historyItemReason}>Reason: {appt.reason || 'N/A'}</Text>
                    {appt.notes && <Text style={styles.historyItemNotes}>Notes: {appt.notes}</Text>}
                  </View>
                ))
              ) : (
                <Text style={styles.noHistoryText}>
                  No past appointments found.
                </Text>
              )}
            </ScrollView>
          )}
          
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#3b82f6',
  },
  loaderContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  modalContent: {
    paddingVertical: 10,
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10, // Add some gap between elements
  },
  historyItemDate: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1, // Allow the date to take available space
  },
  historyItemStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    minWidth: 85, // Give a consistent minimum width
    alignItems: 'center', // Center the text within the badge
  },
  historyItemStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyItemReason: {
    fontSize: 14,
    marginBottom: 5,
  },
  historyItemNotes: {
    fontSize: 14,
    color: '#666',
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  modalCloseButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AppointmentHistoryModal;