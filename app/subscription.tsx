import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function SubscriptionRedirect() {
  useEffect(() => {
    // Redirect to the profile screen
    router.replace('/(tabs)/profile');
  }, []);

  // Show a loading indicator while redirecting
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#16A34A" />
    </View>
  );
} 