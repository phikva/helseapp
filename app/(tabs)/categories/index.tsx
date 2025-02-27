import React from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { Stack } from 'expo-router';
import CategoryList from '../../components/CategoryList';

export default function CategoriesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary-light pt-10 pb-0">
      <Stack.Screen 
        options={{
          title: 'Kategorier',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FCFCEC' },
          headerTitleStyle: { fontFamily: 'Montaga-Regular', fontSize: 32 },
        }} 
      />
      <View className="px-4 mt-0 pt-0">
        <Text className="body-regular text-lg text-text-secondary mb-2">Utforsk oppskrifter etter kategori</Text>
      </View>
      <CategoryList />
    </SafeAreaView>
  );
} 