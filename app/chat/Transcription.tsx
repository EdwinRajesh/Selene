import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Mic, StopCircle } from 'lucide-react-native';
import lightColors from '@/src/constants/Colors';

const VoiceToTextButton = ({ isRecording, startRecording, stopRecording, isProcessing, onTranscription }) => {
  const handlePress = async () => {
    try {
      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', error?.message || 'An unknown error occurred');
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
