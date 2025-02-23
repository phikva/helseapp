import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { client, urlFor } from '@/lib/sanity';
import { getAllRecipesQuery } from '@/lib/queries/recipeQueries';
import RecipeListSkeleton from '../../components/skeleton/RecipeListSkeleton';

interface Recipe {
  _id: string;
  tittel: string;
  image: string;
  kategorier: Array<{
    _id: string;
    name: string;
  }>;
  totalKcal: number;
  totalMakros: {
    protein: number;
    karbs: number;
    fett: number;
  };
}

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const data = await client.fetch(getAllRecipesQuery);
      setRecipes(data);
      setLoading(false);
    } catch (err) {
      setError('Kunne ikke laste inn oppskrifter');
      setLoading(false);
      console.error('Error fetching recipes:', err);
    }
  };

  if (loading) {
    return <RecipeListSkeleton />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={fetchRecipes}
          className="mt-4 bg-cyan-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          title: 'Oppskrifter',
          headerShown: true,
        }} 
      />
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="space-y-4">
            {recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe._id}
                className="bg-white rounded-lg shadow overflow-hidden"
                onPress={() => {
                  router.push({
                    pathname: '/recipes/[id]',
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
                  
                  {/* Categories */}
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {recipe.kategorier.map((kategori) => (
                      <TouchableOpacity
                        key={kategori._id}
                        onPress={() => {
                          router.push({
                            pathname: '/categories/[id]',
                            params: { id: kategori._id }
                          });
                        }}
                        className="bg-gray-100 px-2 py-1 rounded-full"
                      >
                        <Text className="text-sm text-gray-600">{kategori.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="text-gray-600">Kalorier: {recipe.totalKcal} kcal</Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-gray-600">Protein: {recipe.totalMakros.protein}g</Text>
                    <Text className="text-gray-600">Karbohydrater: {recipe.totalMakros.karbs}g</Text>
                    <Text className="text-gray-600">Fett: {recipe.totalMakros.fett}g</Text>
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