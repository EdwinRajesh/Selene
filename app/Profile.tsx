import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserData } from './providers/UserDataProvider';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import lightColors from '@/src/constants/Colors';

const ProfileScreen: React.FC = () => {
  const { userProfile } = useUserData();
  const navigation = useNavigation();
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Update user profile in Firestore
  const handleSave = async () => {
    if (!userProfile.id) return;

    setLoading(true);
    try {
      const userDocRef = doc(FIRESTORE_DB, 'users', userProfile.id);
      await updateDoc(userDocRef, { name, email });
      Alert.alert("Profile Updated", "Your profile has been updated successfully.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (error) {
      Alert.alert("Error", "Failed to log out.");
      console.error("Logout Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Avatar */}
      <Ionicons name="person-circle" size={100} color="black" style={styles.avatar} />

      {/* Editable Name */}
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        editable={isEditing}
        placeholder="Enter your name"
      />

      {/* Editable Email */}
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        editable={isEditing}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      {/* Edit / Save Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={isEditing ? handleSave : () => setIsEditing(true)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
        </Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:8,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: lightColors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;