import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { client, urlFor } from '@/lib/sanity';
import { getAllCategoriesQuery } from '@/lib/queries/categoryQueries';
import { useRouter } from 'expo-router';
import CategoryListSkeleton from './skeleton/CategoryListSkeleton';

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
          className="mt-4 bg-cyan-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row flex-wrap justify-between">
          {categories.map((category) => (
            <TouchableOpacity
              key={category._id}
              className="w-[48%] mb-4 rounded-lg overflow-hidden bg-gray-100 shadow"
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
                <Text className="text-lg font-semibold text-center">
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