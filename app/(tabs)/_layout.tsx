import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../lib/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.green, // Using primary green from theme
        tabBarInactiveTintColor: colors.text.secondary, // Using text secondary from theme
        tabBarStyle: {
          ...Platform.select({
            ios: {
              backgroundColor: colors.primary.light,
            },
            android: {
              backgroundColor: colors.primary.light,
              elevation: 0,
            },
          }),
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          lineHeight: 20,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hjem',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Kategorier',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={26} color={color} />,
          href: '/categories',
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Oppskrifter',
          tabBarIcon: ({ color }) => <Ionicons name="book" size={26} color={color} />,
          href: '/recipes',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
          href: '/profile',
        }}
      />
    </Tabs>
  );
}
