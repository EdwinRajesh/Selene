import { View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserData } from '../providers/UserDataProvider';
import { Appbar } from 'react-native-paper';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import lightColors from '@/src/constants/Colors';

const EditJournal = () => {
  const { id } = useLocalSearchParams();
  const { userData, updateJournal } = useUserData();
  const router = useRouter();

  const journalEntry = userData?.find(entry => entry.id === id);
  const [title, setTitle] = useState(journalEntry?.title || '');
  const [content, setContent] = useState(journalEntry?.content || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!id) return;
    setIsLoading(true);
    await updateJournal(id, { title, content });
    setIsLoading(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Appbar.Header style={styles.header}>
        <AntDesign name="back" size={26} color={lightColors.textSecondary} onPress={() => router.back()} />
        <Text style={styles.buttonText}>Edit Journal Entry</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput style={[styles.textInput, { fontSize: 22 }]} placeholder="Title" value={title} onChangeText={setTitle} />
        <TextInput style={[styles.textInput, styles.contentInput]} placeholder="Write your journal entry here..." multiline value={content} onChangeText={setContent} />
      </ScrollView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={lightColors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default EditJournal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, backgroundColor: '#FFFFFF' },
  buttonText: { color: lightColors.accent, fontFamily: 'firabold', fontSize: 18 },
  saveButton: { backgroundColor: lightColors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5 },
  saveButtonText: { color: '#FFFFFF', fontFamily: 'firaregular', fontSize: 16, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 120 },
  textInput: { padding: 4, fontSize: 18, fontFamily: 'firaregular', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  contentInput: { minHeight: 100, textAlignVertical: 'top' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
});
