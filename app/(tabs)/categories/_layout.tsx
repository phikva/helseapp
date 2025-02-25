import { Stack } from 'expo-router';
import { Pressable, Text, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopHeader } from '../../../components/ui/TopHeader';
import { useRouter } from 'expo-router';

export default function CategoriesLayout() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background pt-12 pb-0">
      <TopHeader />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: 'white' },
          headerShadowVisible: false,
          contentStyle: { paddingTop: 0, paddingBottom: 0 },
          headerTitleStyle: {
            fontFamily: 'heading-medium',
            fontSize: 32,
            color: '#0f172a',
          },
          headerTitleAlign: 'left',
          headerBackVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerBackVisible: false,
            headerTitle: () => (
              <View style={{ marginBottom: -10, height: 40 }}>
                <Text className="font-heading-serif text-display-small text-primary-Black">
                  Kategorier
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: true,
            headerTitle: "",
            presentation: 'card',
          }}
        />
      </Stack>
    </SafeAreaView>
  );
} 