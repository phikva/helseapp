import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { urlFor } from '@/lib/sanity';
import { useRouter } from 'expo-router';
import CategoryListSkeleton from './skeleton/CategoryListSkeleton';
import { useContentStore } from '../../lib/store/contentStore';

// Define the Category type
interface Category {
  _id: string;
  name: string;
  image: string | null;
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200x150.png?text=No+Image';

// Array of Tailwind background color classes to cycle through
const bgColors = [
  'bg-primary-green',
  'bg-primary-cyan',
  'bg-primary-purple',
  'bg-primary-pink',
  'bg-primary-blue',
];

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function CategoryList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { categories, isLoading: contentLoading, error: contentError, refreshContent, isCacheStale } = useContentStore();
  
  // Generate shuffled colors array
  const shuffledColors = useMemo(() => shuffleArray(bgColors), []);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      
      // Check if cache is stale and refresh if needed
      if (isCacheStale()) {
        await refreshContent();
      }
      
      setLoading(false);
    };
    
    loadCategories();
  }, [isCacheStale, refreshContent]);

  if (loading || contentLoading) {
    return <CategoryListSkeleton />;
  }

  if (error || contentError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error || contentError}</Text>
        <TouchableOpacity 
          onPress={refreshContent}
          className="mt-4 bg-primary-green px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper function to get color for an index
  const getColorForIndex = (index: number) => {
    return shuffledColors[index % shuffledColors.length];
  };

  return (
    <ScrollView className="flex-1 bg-primary-light" showsVerticalScrollIndicator={false}>
      <View className="px-4 pt-4">
        <View className="flex-row flex-wrap justify-between">
          {(categories || []).map((category, index) => {
            // Get a color from the shuffled array
            const bgColorClass = getColorForIndex(index);
            
            return (
              <TouchableOpacity
                key={category._id}
                className={`w-[48%] mb-4 rounded-2xl overflow-hidden ${bgColorClass} shadow-sm`}
                onPress={() => {
                  router.push({
                    pathname: '/categories/[id]',
                    params: { id: category._id }
                  });
                }}
              >
                <Image
                  source={{ 
                    uri: category.image 
                      ? urlFor(category.image).width(200).height(150).url() 
                      : PLACEHOLDER_IMAGE 
                  }}
                  className="w-full h-36"
                  resizeMode="cover"
                  onError={(e) => {
                    console.log('Image loading error:', e.nativeEvent.error);
                  }}
                />
                <View className="p-3">
                  <Text className="font-heading-serif text-xl text-text-white" numberOfLines={1}>
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
} 