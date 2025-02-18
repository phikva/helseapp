import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <ThemedView className="flex-1 p-4">
      <View className="flex-row items-center gap-2 mb-4">
        <ThemedText type="title">Velkommen</ThemedText>
        <HelloWave />
      </View>
      
      <ThemedText className="text-lg mb-4">
        Du er nå logget inn i appen!
      </ThemedText>
      
      <ThemedText className="mb-8">
        Her kommer det snart mer innhold.
      </ThemedText>

      <TouchableOpacity 
        onPress={signOut}
        className="bg-red-500 p-4 rounded-lg"
      >
        <ThemedText className="text-white text-center font-bold">
          Logg ut
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
