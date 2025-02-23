import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import CategoryList from '../components/CategoryList';

export default function CategoriesScreen() {
  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          title: 'Recipe Categories',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'white' },
        }} 
      />
      <CategoryList />
    </View>
  );
} 