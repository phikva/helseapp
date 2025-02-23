import { View } from 'react-native';
import Shimmer from './Shimmer';

export default function DietaryRequirementsSkeleton() {
  return (
    <View className="mb-20">
      <Shimmer className="h-8 w-48 rounded-lg mb-2" />
      <Shimmer className="h-6 w-72 rounded-lg mb-6" />
      
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <Shimmer
            key={index}
            className="h-12 w-32 rounded-full"
          />
        ))}
      </View>
    </View>
  );
} 