import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '@/lib/sanity';
import { getRecipeByIdQuery } from '@/lib/queries/recipeQueries';
import RecipeSkeleton from '../../components/skeleton/RecipeSkeleton';
import { BackButton } from '../../../components/ui/BackButton';
import { colors } from '../../../lib/theme';
import { getRecipeImageSource } from '../../../lib/imageUtils';

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
  const { id, color } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the color based on the color parameter
  const accentColor = color ? colors.primary[color as keyof typeof colors.primary] : colors.primary.green;
  
  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const data = await client.fetch(getRecipeByIdQuery, { id });
      setRecipe(data);
      setLoading(false);
    } catch (err) {
      setError('Kunne ikke laste inn oppskriften');
      setLoading(false);
      console.error('Error fetching recipe:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48 }}>
        <Stack.Screen 
          options={{
            title: 'Oppskrift',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.primary.light },
            headerTitleStyle: { fontFamily: 'Montaga-Regular' },
            headerLeft: () => <BackButton onPress={() => router.back()} />,
          }} 
        />
        <RecipeSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48 }}>
        <Stack.Screen 
          options={{
            title: 'Oppskrift',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.primary.light },
            headerTitleStyle: { fontFamily: 'Montaga-Regular' },
            headerLeft: () => <BackButton onPress={() => router.back()} />,
          }} 
        />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center">{error || 'Fant ikke oppskriften'}</Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-4 bg-primary-green px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Gå tilbake</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48 }}>
      <Stack.Screen 
        options={{
          title: recipe.tittel,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.primary.light },
          headerTitleStyle: { 
            fontFamily: 'Montaga-Regular',
            color: accentColor
          },
          headerLeft: () => <BackButton onPress={() => router.back()} />,
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={getRecipeImageSource(recipe.image, 400, 250, recipe._id)}
          className="w-full h-56"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text style={{ color: accentColor }} className="text-4xl font-heading-serif mb-4">{recipe.tittel}</Text>
          
          {/* Categories */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {recipe.kategorier.map((kategori) => (
              <TouchableOpacity
                key={kategori._id}
                onPress={() => {
                  router.push({
                    pathname: '/category/[id]',
                    params: { id: kategori._id }
                  });
                }}
                style={{ backgroundColor: `${accentColor}20` }}
                className="px-3 py-1 rounded-full"
              >
                <Text style={{ color: accentColor }}>{kategori.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nutritional Info */}
          <View className="bg-white p-4 rounded-2xl mb-6 shadow-sm">
            <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-2">Næringsinnhold</Text>
            <Text className="text-text-secondary mb-2">Totalt kalorier: {recipe.totalKcal} kcal</Text>
            <View className="flex-row justify-between">
              <Text className="text-text-secondary">Protein: {recipe.totalMakros.protein}g</Text>
              <Text className="text-text-secondary">Karbohydrater: {recipe.totalMakros.karbs}g</Text>
              <Text className="text-text-secondary">Fett: {recipe.totalMakros.fett}g</Text>
            </View>
          </View>

          {/* Ingredients */}
          <View className="mb-6">
            <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-3">Ingredienser</Text>
            <View className="bg-white rounded-2xl shadow-sm p-4">
              {recipe.ingrediens.map((ingredient, index) => (
                <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <View>
                    <Text className="text-lg">{ingredient.name}</Text>
                    {ingredient.kommentar && (
                      <Text className="text-text-secondary text-sm">{ingredient.kommentar}</Text>
                    )}
                  </View>
                  <Text className="text-text-secondary">
                    {ingredient.measurement 
                      ? `${ingredient.measurement.unitQuantity} ${ingredient.measurement.unit}`
                      : ingredient.mengde}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View className="mb-6">
            <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-3">Fremgangsmåte</Text>
            <View className="bg-white rounded-2xl shadow-sm p-4">
              {recipe.instruksjoner.map((instruction, index) => (
                <View key={index} className="flex-row mb-3">
                  <Text style={{ color: accentColor }} className="font-bold mr-2">{index + 1}.</Text>
                  <Text className="flex-1">{instruction}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Notes */}
          {recipe.notater && (
            <View className="mb-6">
              <Text style={{ color: accentColor }} className="text-xl font-heading-serif mb-2">Notater</Text>
              <View className="bg-white rounded-2xl shadow-sm p-4">
                <Text className="text-text-secondary">{recipe.notater}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 