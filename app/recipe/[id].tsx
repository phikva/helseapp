import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '../../lib/sanity';
import { getRecipeByIdQuery } from '../../lib/queries/recipeQueries';

interface Recipe {
  _id: string;
  tittel: string;
  image: string;
  kategorier: Array<{
    _id: string;
    name: string;
  }>;
  ingrediens: Array<{
    name: string;
    measurement?: {
      unit: string;
      unitQuantity: number;
    };
    mengde?: string;
    kcal: number;
    makros: {
      protein: number;
      karbs: number;
      fett: number;
    };
    kommentar?: string;
  }>;
  instruksjoner: string[];
  notater?: string;
  totalKcal: number;
  totalMakros: {
    protein: number;
    karbs: number;
    fett: number;
  };
}

export default function RecipeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const data = await client.fetch(getRecipeByIdQuery, { id });
      setRecipe(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load recipe');
      setLoading(false);
      console.error('Error fetching recipe:', err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error || 'Recipe not found'}</Text>
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
          title: recipe.tittel,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'white' },
        }} 
      />
      <ScrollView>
        <Image
          source={{ uri: urlFor(recipe.image).width(400).height(200).url() }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2">{recipe.tittel}</Text>
          
          {/* Categories */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {recipe.kategorier.map((kategori) => (
              <TouchableOpacity
                key={kategori._id}
                onPress={() => {
                  router.push({
                    pathname: "/category/[id]" as const,
                    params: { id: kategori._id }
                  });
                }}
                className="bg-gray-100 px-3 py-1 rounded-full"
              >
                <Text className="text-gray-600">{kategori.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nutritional Info */}
          <View className="bg-gray-50 p-4 rounded-lg mb-6">
            <Text className="text-xl font-semibold mb-2">Nutritional Information</Text>
            <Text className="text-gray-600 mb-2">Total Calories: {recipe.totalKcal} kcal</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Protein: {recipe.totalMakros.protein}g</Text>
              <Text className="text-gray-600">Carbs: {recipe.totalMakros.karbs}g</Text>
              <Text className="text-gray-600">Fat: {recipe.totalMakros.fett}g</Text>
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            <Text className="text-xl font-semibold mb-3">Ingredients</Text>
            {recipe.ingrediens.map((ingredient, index) => (
              <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <View>
                  <Text className="text-lg">{ingredient.name}</Text>
                  {ingredient.kommentar && (
                    <Text className="text-gray-500 text-sm">{ingredient.kommentar}</Text>
                  )}
                </View>
                <Text className="text-gray-600">
                  {ingredient.measurement 
                    ? `${ingredient.measurement.unitQuantity} ${ingredient.measurement.unit}`
                    : ingredient.mengde}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View className="mb-6">
            <Text className="text-xl font-semibold mb-3">Instructions</Text>
            {recipe.instruksjoner.map((instruction, index) => (
              <View key={index} className="flex-row mb-3">
                <Text className="text-gray-600 mr-2">{index + 1}.</Text>
                <Text className="flex-1">{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Notes */}
          {recipe.notater && (
            <View className="mb-6">
              <Text className="text-xl font-semibold mb-2">Notes</Text>
              <Text className="text-gray-600">{recipe.notater}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
} 