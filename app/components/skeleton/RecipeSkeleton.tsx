import { View, ScrollView } from 'react-native';
import Shimmer from './Shimmer';

export default function RecipeSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Image */}
        <Shimmer className="w-full h-48" />

        <View className="p-4">
          {/* Title */}
          <Shimmer className="h-8 w-3/4 mb-2" />
          
          {/* Categories */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {[1, 2, 3].map((index) => (
              <Shimmer
                key={index}
                className="h-8 w-24 rounded-full"
              />
            ))}
          </View>

          {/* Nutritional Info */}
          <View className="bg-gray-50 p-4 rounded-lg mb-6">
            <Shimmer className="h-7 w-48 mb-2" />
            <Shimmer className="h-6 w-56 mb-2" />
            <View className="flex-row justify-between">
              <Shimmer className="h-6 w-24" />
              <Shimmer className="h-6 w-24" />
              <Shimmer className="h-6 w-24" />
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            <Shimmer className="h-7 w-40 mb-3" />
            {[1, 2, 3, 4, 5].map((index) => (
              <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <View>
                  <Shimmer className="h-6 w-40 mb-1" />
                  <Shimmer className="h-4 w-32" />
                </View>
                <Shimmer className="h-6 w-20" />
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View className="mb-6">
            <Shimmer className="h-7 w-40 mb-3" />
            {[1, 2, 3].map((index) => (
              <View key={index} className="flex-row mb-3">
                <Shimmer className="h-6 w-6 mr-2" />
                <Shimmer className="h-6 flex-1" />
              </View>
            ))}
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Shimmer className="h-7 w-32 mb-2" />
            <Shimmer className="h-20 w-full rounded-lg" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 