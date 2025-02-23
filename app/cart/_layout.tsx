import { Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: 'white' },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: 'heading-medium',
          fontSize: 24,
          color: '#0f172a',
        },
        headerLeft: () => (
          <Pressable 
            className="flex-row items-center" 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
            <Text className="text-primary-Black text-body-large">Back</Text>
          </Pressable>
        ),
      }}
    />
  );
} 