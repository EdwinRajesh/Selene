import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Calendar from '@/src/components/Calender';
import { useUserData } from '../providers/UserDataProvider';
import JournalEntriesList from '@/src/components/JournalEntriesList';
import DailyQuote from '@/src/components/DailyQoute';
import ChatBotButton from '@/src/components/ChatBotButton';
import TasksComponent from '@/src/components/TaskComponent';
import JournalsComponent from '@/src/components/JournalFlatlistComponent';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const { userData } = useUserData();
  const router = useRouter();

  const formattedDate: string = moment(selectedDate, 'YYYY-MM-DD').format('DD MMMM YYYY');
  const filteredEntries = userData?.filter((entry: any) => entry.date === formattedDate);

  const handleSelectDate = (date: string): void => {
    setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
      <View style={styles.quoteContainer}>
        <DailyQuote date={selectedDate} />
      </View>
      <View style={styles.row}>
        <TasksComponent selectedDate={selectedDate} />
      </View>
      <View>
        <JournalsComponent entries={filteredEntries} />
      </View>
      {/* ChatBotButton is now absolutely positioned */}
      <TouchableOpacity 
        style={styles.chatbotButton}
        onPress={() => router.push('/chat/AIJournalScreen')}
      >
        <ChatBotButton />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    position: 'relative', // Needed for absolute children to position relative to container
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: -24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default HomeScreen;
