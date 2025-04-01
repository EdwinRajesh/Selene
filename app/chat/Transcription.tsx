import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Mic, StopCircle } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Groq } from 'groq-sdk';
import lightColors from '@/src/constants/Colors';

interface VoiceToTextProps {
  onTranscription: (text: string) => void;
}

const groq = new Groq({
  apiKey: process.env.API_KEY,
});

const VoiceToTextButton: React.FC<VoiceToTextProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI available');
      
      await processAudio(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording');
    } finally {
      setRecording(null);
    }
  };

  const processAudio = async (uri: string) => {
    setIsProcessing(true);
    try {
      // Get file information
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `recording-${Date.now()}.m4a`,
        type: 'audio/m4a',
      } as any);
      formData.append('model', 'whisper-large-v3');

      // Send to Groq's Whisper API
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Transcription failed');
      }

      const result = await response.json();
      onTranscription(result.text);
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', error.message || 'Failed to transcribe audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.recording]}
      onPress={handlePress}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator color="white" />
      ) : isRecording ? (
        <StopCircle size={24} color="white" />
      ) : (
        <Mic size={24} color="white" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: lightColors.primary,
    padding: 12,
    borderRadius: 30,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: lightColors.error,
  },
});

export default VoiceToTextButton;