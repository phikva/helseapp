import React from 'react';
import { View, ScrollView } from 'react-native';
import Shimmer from './Shimmer';

export default function RecipeListSkeleton() {
  // Create an array of 4 skeleton items
  const skeletonItems = Array(4).fill(null);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="space-y-4">
          {skeletonItems.map((_, index) => (
            <View
              key={index}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {/* Image Skeleton */}
              <Shimmer className="w-full h-48" />
              
              <View className="p-4">
                {/* Title Skeleton */}
                <Shimmer className="h-7 w-3/4 rounded-lg mb-2" />
                
                {/* Categories Skeleton */}
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {Array(3).fill(null).map((_, catIndex) => (
                    <Shimmer
                      key={catIndex}
                      className="h-6 w-20 rounded-full"
                    />
                  ))}
                </View>

                {/* Calories Skeleton */}
                <Shimmer className="h-5 w-1/3 rounded-lg mb-2" />
                
                {/* Macros Skeleton */}
                <View className="flex-row justify-between mt-2">
                  <Shimmer className="h-5 w-24 rounded-lg" />
                  <Shimmer className="h-5 w-24 rounded-lg" />
                  <Shimmer className="h-5 w-24 rounded-lg" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
} 