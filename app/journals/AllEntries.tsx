import React from 'react';
import { View, StyleSheet, Text, SectionList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserData } from '../providers/UserDataProvider';
import JournalEntriesList from '@/src/components/JournalEntriesList';
import lightColors from '@/src/constants/Colors';

const AllEntries = () => {
  const router = useRouter();
  const { userData } = useUserData(); 

  // Function to parse the date string into a JavaScript Date object
  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split(' ');

    const monthMap: { [key: string]: number } = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    };

    return new Date(parseInt(year), monthMap[month], parseInt(day));
  };

  // Grouping and sorting entries
  const groupedEntries = userData
    ? userData.reduce((acc, entry) => {
        const formattedDate = entry.date; // Assuming date is already in "DD MMMM YYYY" format
        if (!acc[formattedDate]) acc[formattedDate] = [];
        acc[formattedDate].push(entry);
        return acc;
      }, {} as { [key: string]: any[] })
    : {};

  // Convert grouped entries into an array for SectionList
  const sections = Object.keys(groupedEntries)
    .sort((a, b) => parseDate(b).getTime() - parseDate(a).getTime()) // Sort newest first
    .map((date) => ({
      title: date,
      data: groupedEntries[date],
    }));

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="All Entries" titleStyle={styles.title} />
      </Appbar.Header>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.dateHeader}>{title}</Text>
        )}
        renderItem={({ item }) => <JournalEntriesList entries={[item]} />}
      />
    </View>
  );
};

export default AllEntries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    color: lightColors.textPrimary,
    fontFamily: 'firabold',
  },
  title: {
    fontSize: 20,
    fontFamily: 'firamedium',
    color: lightColors.textPrimary,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 8,
    color: lightColors.textPrimary,
  },
});
