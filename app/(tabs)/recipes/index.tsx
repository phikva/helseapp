import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { client, urlFor } from '@/lib/sanity';
import { getAllRecipesQuery } from '@/lib/queries/recipeQueries';
import RecipeListSkeleton from '../../components/skeleton/RecipeListSkeleton';
import { colors } from '../../../lib/theme';

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
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48 }}>
        <Stack.Screen 
          options={{
            title: 'Oppskrifter',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.primary.light },
            headerTitleStyle: { fontFamily: 'Montaga-Regular' },
          }} 
        />
        <RecipeListSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48, paddingBottom: 0 }}>
        <Stack.Screen 
          options={{
            title: 'Oppskrifter',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.primary.light },
            headerTitleStyle: { fontFamily: 'Montaga-Regular' },
          }} 
        />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={fetchRecipes}
            className="mt-4 bg-primary-green px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Prøv igjen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 10 }}>
      <Stack.Screen 
        options={{
          title: 'Oppskrifter',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.primary.light },
          headerTitleStyle: { fontFamily: 'Montaga-Regular' },
        }} 
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4">
          <Text className="body-regular text-lg text-text-secondary mb-4">Alle oppskrifter</Text>
          
          <View className="space-y-4">
            {recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
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
                  <Text className="font-heading-serif text-xl mb-2">{recipe.tittel}</Text>
                  
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
                        className="bg-primary-green/10 px-2 py-1 rounded-full"
                      >
                        <Text className="text-sm text-primary-green">{kategori.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="text-text-secondary">Kalorier: {recipe.totalKcal} kcal</Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-text-secondary">Protein: {recipe.totalMakros.protein}g</Text>
                    <Text className="text-text-secondary">Karbohydrater: {recipe.totalMakros.karbs}g</Text>
                    <Text className="text-text-secondary">Fett: {recipe.totalMakros.fett}g</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 