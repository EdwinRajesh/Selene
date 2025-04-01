import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import DateComponent from './Date'; 
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [month, setMonth] = useState<string>(moment().format('MMMM YYYY'));
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter(); // Navigation hook

  useEffect(() => {
    const startOfMonth = moment().subtract(1, 'month').startOf('month'); // Start from previous month
    const endOfMonth = moment().endOf('month');
    const monthDates = [];

    for (
      let date = startOfMonth;
      date.isBefore(endOfMonth) || date.isSame(endOfMonth, 'day');
      date.add(1, 'days')
    ) {
      monthDates.push(date.clone().toDate());
    }

    setDates(monthDates);
  }, []);

  useEffect(() => {
    const currentDateIndex = dates.findIndex((date) =>
      moment(date).isSame(moment(), 'day')
    );

    if (currentDateIndex !== -1 && scrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      const itemWidth = screenWidth / 7;
      const scrollToX =
        currentDateIndex * itemWidth - screenWidth / 2 + itemWidth / 2;

      scrollViewRef.current.scrollTo({ x: scrollToX, animated: true });
    }
  }, [dates]);

  useEffect(() => {
    if (selectedDate) {
      setMonth(moment(selectedDate).format('MMMM YYYY'));
    }
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthText}>{month}</Text>
        <TouchableOpacity onPress={() => router.push('/Profile')}>
          <Ionicons name="person-circle-outline" size={40} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.scroll}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {dates.map((date, index) => (
            <DateComponent
              key={index}
              date={date}
              onSelectDate={onSelectDate}
              selected={selectedDate}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes items to the edges
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'firabold',
  },
  scroll: {
    flexDirection: 'row',
  },
});

export default Calendar;