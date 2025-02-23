import { View } from 'react-native';
import Shimmer from './Shimmer';

export default function PortionSettingsSkeleton() {
  return (
    <View className="mb-20">
      <Shimmer className="h-8 w-48 rounded-lg mb-2" />
      <Shimmer className="h-6 w-72 rounded-lg mb-6" />
      
      <View className="bg-background-secondary rounded-2xl p-4">
        <View className="flex-row flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <Shimmer
              key={number}
              className="w-14 h-14 rounded-full"
            />
          ))}
        </View>
      </View>
    </View>
  );
} 