import React from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { Stack } from 'expo-router';
import CategoryList from '../../components/CategoryList';
import { colors } from '../../../lib/theme';

export default function CategoriesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 10, paddingBottom: 0 }}>
      <Stack.Screen 
        options={{
          title: 'Kategorier',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.primary.light },
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