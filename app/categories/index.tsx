import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import CategoryList from '../components/CategoryList';
import { useRouter } from 'expo-router';
import { colors } from '../../lib/theme';

export default function CategoriesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to recipes page
    router.replace('/recipes');
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary.light }}>
      <ActivityIndicator size="large" color={colors.primary.green} />
    </View>
  );
}

export function CategoriesScreen() {
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