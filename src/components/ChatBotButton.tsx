import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import lightColors from '../constants/Colors';

const ChatBotButton = () => {
  const router = useRouter();

  return (
    <View style={styles.button}>
      <Ionicons name="sparkles" size={28} color="white" />
      <Text style={styles.buttonText}>Ask Selene</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 130,
    height: 90,
    backgroundColor: lightColors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    transform: [{ translateY: -3 }],
    borderWidth: 2,
    borderColor: '#38B2AC',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ChatBotButton;
