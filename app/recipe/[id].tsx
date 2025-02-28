import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '../../lib/sanity';
import { getRecipeByIdQuery } from '../../lib/queries/recipeQueries';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/store/authStore';
import { saveRecipe, removeRecipe } from '../../lib/services/savedRecipesService';
import { useSavedRecipesStore } from '../../lib/store/savedRecipesStore';
import { useContentStore } from '../../lib/store/contentStore';

interface Recipe {
  _id: string;
  tittel: string;
  image: string;
  beskrivelse: string;
  ingredienser: Array<{
    _key: string;
    mengde: string;
    ingrediens: {
      _id: string;
      name: string;
    };
  }>;
  fremgangsmate: string[];
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
  tilberedningstid?: string;
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuthStore();
  const { savedRecipes, favoriteRecipes, refreshFavoriteRecipes } = useSavedRecipesStore();
  const { getRecipeColor } = useContentStore();
  
  // Get the color for this recipe using the consistent function
  const colorName = getRecipeColor(id as string);
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await client.fetch(getRecipeByIdQuery, { id });
        setRecipe(recipeData);
        checkFavoriteStatus(recipeData._id);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Check if recipe is in favorites
  const checkFavoriteStatus = (recipeId: string) => {
    const isFav = favoriteRecipes.some(item => item.recipe_id === recipeId && item.is_favorite);
    setIsFavorite(isFav);
  };

  // Update favorite status when savedRecipes changes
  useEffect(() => {
    if (recipe) {
      checkFavoriteStatus(recipe._id);
    }
  }, [favoriteRecipes, recipe]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!session?.user) {
      Alert.alert(
        'Logg inn',
        'Du må være logget inn for å lagre oppskrifter',
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Logg inn', onPress: () => router.push('/(auth)/sign-in') }
        ]
      );
      return;
    }

    setSavingStatus(true);

    try {
      // Toggle the favorite status (true to add, false to remove)
      if (isFavorite) {
        await removeRecipe(session.user.id, recipe?._id as string);
      } else {
        await saveRecipe(session.user.id, recipe?._id as string, true);
      }
      
      // Refresh both lists to ensure consistency
      refreshFavoriteRecipes();
      
      // Also refresh the savedRecipes list
      const { refreshSavedRecipes } = useSavedRecipesStore.getState();
      refreshSavedRecipes();
      
      Alert.alert(
        isFavorite ? 'Fjernet fra favoritter' : 'Lagt til i favoritter',
        isFavorite ? 'Oppskriften er fjernet fra favorittene dine' : 'Oppskriften er lagt til i favorittene dine'
      );
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      
      // Handle specific error messages
      let errorMessage = 'Det oppstod en feil ved lagring av oppskriften';
      
      if (error.message) {
        if (error.message.includes('session has expired') || 
            error.message.includes('No active session') ||
            error.message.includes('User ID mismatch')) {
          errorMessage = error.message;
          // Redirect to login if session issues
          Alert.alert(
            'Sesjonsfeil',
            errorMessage,
            [
              { text: 'Avbryt', style: 'cancel' },
              { text: 'Logg inn', onPress: () => router.push('/(auth)/sign-in') }
            ]
          );
          return;
        } else if (error.code === '42501') {
          errorMessage = 'Du har ikke tillatelse til å lagre denne oppskriften. Vennligst logg inn på nytt.';
        }
      }
      
      Alert.alert('Feil', errorMessage);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center bg-primary-${colorName}`}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View className={`flex-1 justify-center items-center bg-primary-${colorName}`}>
        <Text className="text-white text-center">{error || 'Recipe not found'}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-white px-4 py-2 rounded-lg"
        >
          <Text className="text-primary-green">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 bg-primary-${colorName}`}>
      <Stack.Screen
        options={{
          title: recipe.tittel || 'Recipe Details',
          headerTransparent: true,
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
        }}
      />
      
      {/* Recipe Image */}
      <Image
        source={{ uri: recipe.image ? urlFor(recipe.image).width(600).url() : 'https://via.placeholder.com/600x400.png?text=No+Image' }}
        className="w-full h-72"
        resizeMode="cover"
      />
      
      {/* Content Container */}
      <View className="bg-white rounded-t-3xl -mt-6 pt-6 px-4 min-h-screen">
        {/* Recipe Title and Favorite Button */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-heading-serif text-2xl text-text-primary flex-1 pr-2">{recipe.tittel}</Text>
          
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={savingStatus}
            className="p-2"
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={28} 
              color={isFavorite ? "#FF6B6B" : "#666"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Categories */}
        {recipe.kategorier && recipe.kategorier.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {recipe.kategorier.map((kategori) => (
              <TouchableOpacity
                key={kategori._id}
                onPress={() => {
                  router.push({
                    pathname: '/categories/[id]',
                    params: { id: kategori._id }
                  });
                }}
                className={`bg-primary-${colorName}/20 px-3 py-1 rounded-full`}
              >
                <Text className="text-sm text-text-primary">{kategori.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Nutrition Info */}
        <View className="bg-gray-100 p-4 rounded-lg mb-6">
          <Text className="font-medium mb-2">Næringsinnhold</Text>
          <Text>Kalorier: {recipe.totalKcal || 0} kcal</Text>
          <View className="flex-row justify-between mt-1">
            <Text>Protein: {recipe.totalMakros?.protein || 0}g</Text>
            <Text>Karbohydrater: {recipe.totalMakros?.karbs || 0}g</Text>
            <Text>Fett: {recipe.totalMakros?.fett || 0}g</Text>
          </View>
        </View>
        
        {/* Description */}
        {recipe.beskrivelse && (
          <View className="mb-6">
            <Text className="font-medium mb-2">Beskrivelse</Text>
            <Text className="text-text-secondary">{recipe.beskrivelse}</Text>
          </View>
        )}
        
        {/* Ingredients */}
        <View className="mb-6">
          <Text className="font-medium mb-2">Ingredienser</Text>
          {recipe.ingredienser && recipe.ingredienser.map((item) => (
            <View key={item._key} className="flex-row py-1 border-b border-gray-100">
              <Text className="w-24 text-text-secondary">{item.mengde}</Text>
              <Text className="flex-1 text-text-primary">{item.ingrediens.name}</Text>
            </View>
          ))}
        </View>
        
        {/* Instructions */}
        <View className="mb-6">
          <Text className="font-medium mb-2">Fremgangsmåte</Text>
          {recipe.fremgangsmate && recipe.fremgangsmate.map((step, index) => (
            <View key={index} className="mb-3">
              <Text className="font-medium text-text-primary">Steg {index + 1}</Text>
              <Text className="text-text-secondary">{step}</Text>
            </View>
          ))}
        </View>
        
        {/* Preparation Time */}
        {recipe.tilberedningstid && (
          <View className="mb-6 flex-row items-center">
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text className="ml-2 text-text-secondary">Tilberedningstid: {recipe.tilberedningstid}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
} 