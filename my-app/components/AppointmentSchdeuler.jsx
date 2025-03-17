import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Calendar from 'react-native-calendars';


const AppointmentScheduler = ({ visible, onClose, patientInfo}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [availableTimes, setAvailableTimes] = useState([]);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', 
    '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  // Handle date selection
  const handleDateSelect = (day) => {
    const dateString = day.dateString;
    
    // Update marked dates
    const updatedMarkedDates = {
      [dateString]: {
        selected: true,
        selectedColor: '#3b82f6'
      }
    };
    
    setMarkedDates(updatedMarkedDates);
    setSelectedDate(dateString);
    
    // In a real app, you would fetch available times for this date from the server
    // For now, we'll simulate this with a random set of available times
    const simulateAvailableTimes = () => {
      setLoading(true);
      setTimeout(() => {
        // Simulate some time slots being unavailable
        const availableSlots = timeSlots.filter(() => Math.random() > 0.3);
        setAvailableTimes(availableSlots);
        setLoading(false);
      }, 500);
    };
    
    simulateAvailableTimes();
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, this would be an API call to your backend
      // Example:
      /*
      const response = await fetch(`http://${serverIP}:5001/schedule-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientInfo.adharNumber,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule appointment');
      }
      */
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        `Appointment scheduled for ${patientInfo.name} on ${selectedDate} at ${selectedTime}`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to get disabled dates (past dates)
  const getDisabledDates = () => {
    const today = new Date();
    const disabledDates = {};
    
    // Disable dates before today
    for (let i = 1; i <= today.getDate(); i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      disabledDates[dateString] = { disabled: true, disableTouchEvent: true };
    }
    
    return disabledDates;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Appointment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.patientInfoContainer}>
              <Text style={styles.patientInfoLabel}>Patient:</Text>
              <Text style={styles.patientInfoValue}>{patientInfo?.name}</Text>
            </View>
            
            <View style={styles.calendarContainer}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                disabledDates={getDisabledDates()}
                minDate={new Date().toISOString().split('T')[0]}
                maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
                theme={{
                  todayTextColor: '#3b82f6',
                  selectedDayBackgroundColor: '#3b82f6',
                  arrowColor: '#3b82f6',
                }}
              />
            </View>
            
            {selectedDate && (
              <View style={styles.timeSelectionContainer}>
                <Text style={styles.sectionTitle}>Select Time</Text>
                {loading ? (
                  <ActivityIndicator size="large" color="#3b82f6" />
                ) : (
                  <View style={styles.timeSlotContainer}>
                    {availableTimes.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlot,
                          selectedTime === time && styles.selectedTimeSlot,
                        ]}
                        onPress={() => handleTimeSelect(time)}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          selectedTime === time && styles.selectedTimeSlotText,
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.bookButton]}
                onPress={handleBookAppointment}
                disabled={!selectedDate || !selectedTime || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Book Appointment</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  patientInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientInfoLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  patientInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeSelectionContainer: {
    padding: 16,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '31%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  timeSlotText: {
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  bookButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AppointmentScheduler;