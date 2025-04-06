// SpeechManager.js
import Voice from '@react-native-voice/voice';

class SpeechManager {
  constructor() {
    this.activeField = null;
    this.callback = null;
    this.isListening = false;
    
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }
  
  onSpeechStart = () => {
    console.log('Speech recognition started');
    this.isListening = true;
  };
  
  onSpeechEnd = () => {
    console.log('Speech recognition ended');
    this.isListening = false;
    this.activeField = null; // ✅ Now safe to clear
    this.callback = null;
  };
  
  onSpeechResults = (event) => {
    console.log('Speech results received:', event.value);
  
    if (!this.activeField || !this.callback || !event.value || event.value.length === 0) {
      console.log("❌ Callback not invoked — condition failed");
      return;
    }
  
    const result = event.value[0]; // always the most updated sentence
    console.log(`✅ Invoking callback: field=${this.activeField}, value=${result}`);
    this.callback(this.activeField, result);

  };
  
  
    // In SpeechManager.js
    onSpeechError = (error) => {
        console.error('Speech recognition error:', error);
        
        // Don't immediately set isListening to false
        // Give the UI a moment to show the listening state
        setTimeout(() => {
        this.isListening = false;
        }, 1000);
  };
  
  startListening = async (fieldName, callback, language = 'en-US') => {
    try {
        const available = await this.checkAvailability();
        if (!available) {
          console.log('Speech recognition not available on this device');
          alert('Speech recognition is not available on this device');
          return;
        }


      // Stop any existing session
      if (this.isListening) {
        await Voice.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Set active field and callback
      this.activeField = fieldName;
      this.callback = callback;

      console.log("Setting callback for field:", fieldName);
console.log("Callback is a function?", typeof callback === 'function');
      
      // Start listening
      console.log(`Starting listening for field: ${fieldName} with language: ${language}`);
      await Voice.start(language);
      console.log('Voice.start completed successfully');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // Keep isListening true for a moment so the UI shows feedback
      setTimeout(() => {
        this.isListening = false;
      }, 1000);
    }
  };

  checkAvailability = async () => {
    try {
      const isAvailable = await Voice.isAvailable();
      console.log('Speech recognition available:', isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Error checking speech availability:', error);
      return false;
    }
  };
  
  stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };
  
  cleanup = async () => {
    try {
      await Voice.destroy();
    } catch (error) {
      console.error('Error cleaning up Voice:', error);
    }
  };
}

// Create and export a singleton instance
export default new SpeechManager();