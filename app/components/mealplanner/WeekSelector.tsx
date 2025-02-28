import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, fonts } from '../../../lib/theme';

type WeekSelectorProps = {
  currentWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
};

const WeekSelector = ({ currentWeek, onPreviousWeek, onNextWeek }: WeekSelectorProps) => {
  // Get the week display text (e.g., "1. jan - 7. jan")
  const getWeekDisplay = () => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startMonth = weekStart.toLocaleString('no-NO', { month: 'short' });
    const endMonth = weekEnd.toLocaleString('no-NO', { month: 'short' });
    
    return `${weekStart.getDate()}. ${startMonth} - ${weekEnd.getDate()}. ${endMonth}`;
  };

  // Get the week number
  const getWeekNumber = () => {
    const date = new Date(currentWeek);
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekInfo}>
        <Text style={styles.weekNumber}>Uke {getWeekNumber()}</Text>
        <Text style={styles.weekDisplay}>{getWeekDisplay()}</Text>
      </View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          onPress={onPreviousWeek} 
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary.green} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onNextWeek} 
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.primary.green} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  weekInfo: {
    flexDirection: 'column',
  },
  weekNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary.green,
    fontFamily: fonts.heading.serif,
    marginBottom: 2,
  },
  weekDisplay: {
    fontSize: 16,
    color: colors.primary.black,
    fontFamily: fonts.body.medium,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    backgroundColor: 'rgba(74, 108, 98, 0.1)',
    borderRadius: 20,
    marginLeft: 8,
  },
});

export default WeekSelector; 