import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../../lib/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

type HeaderProps = {
  title: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
};

const Header = ({ 
  title, 
  iconName, 
  iconSize = 24, 
  iconColor = colors.primary.black 
}: HeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={iconSize} 
            color={iconColor} 
            style={styles.icon} 
          />
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.black,
    fontFamily: fonts.heading.serif,
  },
});

export default Header; 