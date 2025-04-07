import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SpeechManager from './SpeechManager';

const SpeechInput = ({ onSpeechResult, placeholder, language = 'en-US', fieldName, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  useEffect(() => {
    // Listen for global speech state changes
    const interval = setInterval(() => {
      if (SpeechManager.activeField === fieldName) {
        if (SpeechManager.isListening !== isListening) {
          setIsListening(SpeechManager.isListening);
        }
      } else if (isListening) {
        setIsListening(false);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (SpeechManager.activeField === fieldName) {
        SpeechManager.stopListening();
      }
    };
  }, [fieldName, isListening]);

  const startListening = async () => {
    try {
      setIsListening(true);
      await SpeechManager.startListening(fieldName, onSpeechResult, language);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      if (onError) {
        onError('Failed to start speech recognition');
      }
    }
  };

  const stopListening = async () => {
    try {
      await SpeechManager.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Voice Input:</Text>
        <Switch
          value={isSpeechEnabled}
          onValueChange={setIsSpeechEnabled}
          trackColor={{ false: "#d3d3d3", true: "#e5cedc" }}
          thumbColor={isSpeechEnabled ? "#8f2d56" : "#f4f3f4"}
        />
      </View>
      
      {isSpeechEnabled && (
        <TouchableOpacity
          style={[styles.button, isListening ? styles.listeningButton : {}]}
          onPress={isListening ? stopListening : startListening}
        >
          {isListening ? (
            <View style={styles.listeningContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Listening...</Text>
            </View>
          ) : (
            <View style={styles.iconTextContainer}>
              <MaterialIcons name="mic" size={20} color="#FFF" />
              <Text style={styles.buttonText}>
                {placeholder || 'Speak now'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// Same styles as before
const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  toggleLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#8f2d56',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningButton: {
    backgroundColor: '#e74c3c',
  },
  listeningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default SpeechInput;