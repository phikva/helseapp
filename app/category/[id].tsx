import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '../../lib/sanity';
import { getCategoryWithRecipesQuery } from '../../lib/queries/categoryQueries';

interface Recipe {
  _id: string;
  tittel: string;
  image: string;
  totalKcal: number;
  totalMakros: {
    protein: number;
    karbs: number;
    fett: number;
  };
}

interface Category {
  _id: string;
  name: string;
  image: string;
  recipes: Recipe[];
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const data = await client.fetch(getCategoryWithRecipesQuery, { id });
      setCategory(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load category');
      setLoading(false);
      console.error('Error fetching category:', err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  if (error || !category) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error || 'Category not found'}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-cyan-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          title: category.name,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'white' },
        }} 
      />
      <ScrollView>
        <Image
          source={{ uri: urlFor(category.image).width(400).height(200).url() }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="text-2xl font-bold mb-4">{category.name} Recipes</Text>
          <View className="space-y-4">
            {category.recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe._id}
                className="bg-white rounded-lg shadow overflow-hidden"
                onPress={() => {
                  router.push({
                    pathname: '/explore/recipe/[id]',
                    params: { id: recipe._id }
                  });
                }}
              >
                <Image
                  source={{ uri: urlFor(recipe.image).width(400).height(200).url() }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <Text className="text-xl font-semibold mb-2">{recipe.tittel}</Text>
                  <Text className="text-gray-600">Calories: {recipe.totalKcal} kcal</Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-gray-600">Protein: {recipe.totalMakros.protein}g</Text>
                    <Text className="text-gray-600">Carbs: {recipe.totalMakros.karbs}g</Text>
                    <Text className="text-gray-600">Fat: {recipe.totalMakros.fett}g</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 