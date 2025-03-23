import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AppointmentModal = ({ visible, onClose, onSubmit, patientName }) => {
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const resetForm = () => {
    setAppointmentDate(new Date());
    setAppointmentTime(new Date());
    setAppointmentReason('');
    setAppointmentNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
  // Create a date object representing exactly what the user entered
  const combinedDateTime = new Date(appointmentDate);
  combinedDateTime.setHours(
    appointmentTime.getHours(),
    appointmentTime.getMinutes(),
    0
  );
  
  // Adjust for the timezone offset to preserve the exact time entered
  // This effectively cancels out the automatic timezone conversion
  const offset = combinedDateTime.getTimezoneOffset() * 60000;
  const adjustedDateTime = new Date(combinedDateTime.getTime() - offset);
  
  onSubmit({
    appointmentDateTime: adjustedDateTime,
    reason: appointmentReason,
    notes: appointmentNotes
  });
  resetForm();
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setAppointmentDate(selectedDate);
      
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setAppointmentTime(selectedTime);
      
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }
    } else {
      setShowTimePicker(false);
    }
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm} IST`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.modalTitle}>Create New Appointment</Text>
            
            {patientName && (
              <View style={styles.patientNameContainer}>
                <Text style={styles.patientNameLabel}>Patient:</Text>
                <Text style={styles.patientNameValue}>{patientName}</Text>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Appointment Date:</Text>
              <TouchableOpacity 
                style={styles.dateTimePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  {appointmentDate.toLocaleDateString('en-IN')}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? "spinner" : "default"}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  style={styles.dateTimePicker}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Appointment Time (IST):</Text>
              <TouchableOpacity 
                style={styles.dateTimePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  {formatTime(appointmentTime)}
                </Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={appointmentTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? "spinner" : "default"}
                  onChange={onTimeChange}
                  style={styles.dateTimePicker}
                  is24Hour={false}
                />
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reason: <Text style={styles.requiredMark}>*</Text></Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter reason for appointment"
                value={appointmentReason}
                onChangeText={setAppointmentReason}
              />
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.createButton, 
                !appointmentReason.trim() && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!appointmentReason.trim()}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  scrollContent: {
    padding: 20
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#3b82f6'
  },
  patientNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15
  },
  patientNameLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
    marginRight: 8
  },
  patientNameValue: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  formGroup: {
    marginBottom: 18
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333'
  },
  requiredMark: {
    color: 'red'
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  dateTimePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fafafa'
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333'
  },
  dateTimePicker: {
    marginTop: 10,
    alignSelf: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    borderBottomLeftRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  createButton: {
    borderBottomRightRadius: 20,
    backgroundColor: '#3b82f6'
  },
  disabledButton: {
    backgroundColor: '#a0c0f3',
    opacity: 0.7
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default AppointmentModal;