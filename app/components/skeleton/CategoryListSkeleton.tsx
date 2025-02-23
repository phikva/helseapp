import React from 'react';
import { View } from 'react-native';
import Shimmer from './Shimmer';

export default function CategoryListSkeleton() {
  // Create an array of 4 skeleton items
  const skeletonItems = Array(4).fill(null);

  return (
    <View className="flex-1 bg-white p-4">
      {/* Title Skeleton */}
      <Shimmer className="h-8 w-40 rounded-lg mb-4" />
      
      <View className="flex-row flex-wrap justify-between">
        {skeletonItems.map((_, index) => (
          <View 
            key={index}
            className="w-[48%] mb-4 rounded-lg overflow-hidden bg-gray-100"
          >
            {/* Image Skeleton */}
            <Shimmer className="w-full h-36" />
            
            {/* Text Skeleton */}
            <View className="p-3 items-center">
              <Shimmer className="h-6 w-24 rounded-lg" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
} 