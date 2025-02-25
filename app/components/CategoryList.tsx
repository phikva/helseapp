import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { client, urlFor } from '@/lib/sanity';
import { getAllCategoriesQuery } from '@/lib/queries/categoryQueries';
import { useRouter } from 'expo-router';
import CategoryListSkeleton from './skeleton/CategoryListSkeleton';
import { colors } from '../../lib/theme';

// Define the Category type
interface Category {
  _id: string;
  name: string;
  image: string | null;
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200x150.png?text=No+Image';

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await client.fetch(getAllCategoriesQuery);
      setCategories(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load categories');
      setLoading(false);
      console.error('Error fetching categories:', err);
    }
  };

  if (loading) {
    return <CategoryListSkeleton />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={fetchCategories}
          className="mt-4 bg-primary-green px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.primary.light }} showsVerticalScrollIndicator={false}>
      <View className="px-4 pt-4">
    
        
        <View className="flex-row flex-wrap justify-between">
          {categories.map((category) => (
            <TouchableOpacity
              key={category._id}
              className="w-[48%] mb-4 rounded-2xl overflow-hidden bg-white shadow-sm"
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
                <Text className="font-heading-serif text-xl" numberOfLines={1}>
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
} 