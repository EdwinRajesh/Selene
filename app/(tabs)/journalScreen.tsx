import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserData } from '../providers/UserDataProvider';
import SearchBar from '@/src/components/SearchBar';
import JournalButton from '@/src/components/JournalButton';
import moment from 'moment';
import JournalEntriesList from '@/src/components/JournalEntriesList';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import lightColors from '@/src/constants/Colors';
import TagCarousel from '@/src/components/TagCards';

const JournalScreen = () => {
  const router = useRouter();
  const { userData } = useUserData();
  const user = FIREBASE_AUTH.currentUser;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

  const handlePress = () => {
    router.push('/journals/JournalEntry');
  };

  const handleViewAllPress = () => {
    router.push('/journals/AllEntries');
  };

  const handleSearchPress = () => {
    router.push('/journals/SearchJournal');
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();

    const [day, month, year] = dateString.split(' ');

    const monthMap: { [key: string]: number } = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const monthIndex = monthMap[month];
    return new Date(year, monthIndex, parseInt(day));
  };

  const sortedEntries = userData
    ? [...userData].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  const selectedTags = userData
    ?.flatMap(entry => entry.tags || [])
    .filter((tag, index, self) => tag && self.indexOf(tag) === index);

  const recentEntries = sortedEntries.slice(0, 3);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lightColors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
     
    >
      <FlatList
        data={recentEntries}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <>
            <TouchableOpacity onPress={handleSearchPress}>

<View style={styles.searchContainer}>
    <SearchBar/>
</View>
</TouchableOpacity>

            <View style={styles.tagContainer}>
              <TagCarousel tags={selectedTags} />
            </View>

            <JournalButton title="Create New Journal Entry" onPress={handlePress} />

            {userData && userData.length > 0 && (
              <View style={styles.journalHeader}>
                <Text style={styles.userDataText}>Recent Entries :</Text>
                <TouchableOpacity onPress={handleViewAllPress} style={styles.viewAllButton}>
                  <View style={styles.viewAllContent}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="chevron-forward" size={16} color={lightColors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => <JournalEntriesList entries={[item]} />}
        ListEmptyComponent={<Text style={styles.noEntriesText}>No journal entries available</Text>}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  searchContainer: {
    marginBottom: 8,
  },
  tagContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,

  },
  userDataText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 22,
    color: lightColors.primary,
  },
  viewAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noEntriesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default JournalScreen;