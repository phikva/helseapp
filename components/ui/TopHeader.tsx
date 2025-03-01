import { View, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function TopHeader() {
  const router = useRouter();
  
  // Use platform-specific padding
  const verticalPadding = Platform.OS === 'android' ? 'py-1' : 'py-2';

  return (
    <View className={`px-4 ${verticalPadding} flex-row justify-between items-center border-b border-gray-200 bg-primary-light`}>
      <TouchableOpacity onPress={() => router.push('/cart')}>
        <Feather name="shopping-cart" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/search' as any)}>
        <Feather name="search" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/menu' as any)}>
        <Feather name="menu" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
} 