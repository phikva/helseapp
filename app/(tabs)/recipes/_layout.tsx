import { Stack } from 'expo-router';
import { Pressable, Text, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopHeader } from '../../../components/ui/TopHeader';
import { useRouter } from 'expo-router';

export default function RecipesLayout() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-primary-light pt-16">
      <TopHeader />
      <View style={{ height: 24, backgroundColor: '#FCFCEC' }} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FCFCEC' },
          headerShadowVisible: false,
          contentStyle: { paddingTop: 0 },
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
            headerTitle: '',
            headerLeft: () => (
              <View style={{ marginLeft: 0, paddingBottom: 10 }}>
                <Text className="font-heading-serif text-4xl text-primary-Black ">
                  Oppskrifter
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