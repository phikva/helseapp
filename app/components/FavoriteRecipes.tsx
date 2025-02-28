import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSavedRecipesStore } from '../../lib/store/savedRecipesStore';
import { urlFor } from '../../lib/sanity';
import { Ionicons } from '@expo/vector-icons';
import RecipeFilters from './RecipeFilters';
import { useContentStore } from '../../lib/store/contentStore';
import { useAuthStore } from '../../lib/store/authStore';
import { removeRecipe } from '../../lib/services/savedRecipesService';
import { getRecipeImageSource } from '../../lib/imageUtils';

interface FilterValues {
  searchTerm: string;
  selectedCategories: string[];
  calories: { min: number; max: number };
  protein: { min: number; max: number };
  carbs: { min: number; max: number };
  fat: { min: number; max: number };
}

interface FavoriteRecipesProps {
  onRecipeSelect?: (recipeId: string, colorName: string) => void;
}

const FavoriteRecipes = ({ onRecipeSelect }: FavoriteRecipesProps) => {
  const router = useRouter();
  const { favoriteRecipes, isLoading, error, refreshFavoriteRecipes, isCacheStale } = useSavedRecipesStore();
  const { recipes, getRecipeColor } = useContentStore();
  const { session } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [removingRecipeId, setRemovingRecipeId] = useState<string | null>(null);
  const recipeFiltersRef = useRef<{
    resetFilters: () => void;
  }>(null);
  
  // Max values for filters - define this BEFORE filters state
  const [maxValues, setMaxValues] = useState({
    calories: 2000,
    protein: 100,
    carbs: 200,
    fat: 100
  });
  
  // Filter state - now maxValues is defined before being used
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategories: [] as string[],
    calories: { min: 0, max: maxValues.calories },
    protein: { min: 0, max: maxValues.protein },
    carbs: { min: 0, max: maxValues.carbs },
    fat: { min: 0, max: maxValues.fat }
  });

  useEffect(() => {
    const loadFavorites = async () => {
      // If we already have cached favorite recipes and cache is not stale, don't show loading state
      if (favoriteRecipes && favoriteRecipes.length > 0 && !isCacheStale()) {
        console.log("Using cached favorite recipes:", favoriteRecipes.length);
        setLocalLoading(false);
        return;
      }
      
      // If we know for sure there are no favorites, don't show loading state
      if (favoriteRecipes && favoriteRecipes.length === 0 && !isCacheStale()) {
        console.log("No favorites in cache, showing empty state");
        setLocalLoading(false);
        return;
      }
      
      setLocalLoading(true);
      
      // Check if user is logged in
      if (!session?.user) {
        console.log("No user session found");
        setLocalError("Du må være logget inn for å se favoritter");
        setLocalLoading(false);
        return;
      }
      
      try {
        console.log("Loading favorite recipes...");
        
        // Set a shorter timeout to prevent long loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Loading timed out")), 5000)
        );
        
        // Race between the actual loading and the timeout
        await Promise.race([
          refreshFavoriteRecipes(),
          timeoutPromise
        ]);
        
        // Immediately set loading to false after refresh completes
        setLocalLoading(false);
        
        // Check if we have favorites after refreshing
        if (favoriteRecipes.length === 0) {
          console.log("No favorite recipes found after refresh");
        } else {
          console.log("Favorite recipes loaded:", favoriteRecipes.length);
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
        setLocalError(err instanceof Error ? err.message : "Failed to load favorites");
        setLocalLoading(false);
      }
    };
    
    loadFavorites();
  }, [session, isCacheStale]);
  
  useEffect(() => {
    console.log("Favorite recipes updated:", favoriteRecipes);
    
    // Calculate max values for filters based on favorite recipes
    if (favoriteRecipes && favoriteRecipes.length > 0) {
      // Make sure we have recipes with valid data
      const recipesWithData = favoriteRecipes.filter(item => 
        item.recipe && 
        (item.recipe.totalKcal !== undefined || 
         (item.recipe.totalMakros && 
          (item.recipe.totalMakros.protein !== undefined || 
           item.recipe.totalMakros.karbs !== undefined || 
           item.recipe.totalMakros.fett !== undefined)))
      );
      
      if (recipesWithData.length === 0) {
        console.log("No recipes with valid nutritional data found");
        return;
      }
      
      const maxCalories = Math.max(...recipesWithData.map((item) => item.recipe?.totalKcal || 0));
      const maxProtein = Math.max(...recipesWithData.map((item) => item.recipe?.totalMakros?.protein || 0));
      const maxCarbs = Math.max(...recipesWithData.map((item) => item.recipe?.totalMakros?.karbs || 0));
      const maxFat = Math.max(...recipesWithData.map((item) => item.recipe?.totalMakros?.fett || 0));
      
      const newMaxValues = {
        calories: Math.ceil(maxCalories / 100) * 100 || 2000, // Round up to nearest 100, default to 2000
        protein: Math.ceil(maxProtein / 5) * 5 || 100, // Round up to nearest 5, default to 100
        carbs: Math.ceil(maxCarbs / 10) * 10 || 200, // Round up to nearest 10, default to 200
        fat: Math.ceil(maxFat / 5) * 5 || 100 // Round up to nearest 5, default to 100
      };
      
      console.log("Setting new max values:", newMaxValues);
      setMaxValues(newMaxValues);
      setFilters(prev => ({
        ...prev,
        calories: { min: 0, max: newMaxValues.calories },
        protein: { min: 0, max: newMaxValues.protein },
        carbs: { min: 0, max: newMaxValues.carbs },
        fat: { min: 0, max: newMaxValues.fat }
      }));
    }
  }, [favoriteRecipes]);

  // Helper function to get color for a recipe
  const getColorForRecipe = (recipeId: string) => {
    const colorName = getRecipeColor(recipeId);
    return `bg-primary-${colorName}`;
  };
  
  // Handle unfavoriting a recipe
  const unfavoriteRecipe = async (recipeId: string, event?: any) => {
    // Prevent the card click event from triggering
    if (event) {
      event.stopPropagation();
    }
    
    if (!session?.user) {
      Alert.alert(
        'Logg inn',
        'Du må være logget inn for å endre favoritter',
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Logg inn', onPress: () => router.push('/(auth)/sign-in') }
        ]
      );
      return;
    }
    
    setRemovingRecipeId(recipeId);
    
    try {
      await removeRecipe(session.user.id, recipeId);
      
      // Refresh both the favorites list and the saved recipes list
      refreshFavoriteRecipes();
      
      // Also refresh the savedRecipes list to ensure consistency across tabs
      const { refreshSavedRecipes } = useSavedRecipesStore.getState();
      refreshSavedRecipes();
      
      Alert.alert(
        'Fjernet fra favoritter',
        'Oppskriften er fjernet fra favorittene dine'
      );
    } catch (error: any) {
      console.error('Error removing recipe:', error);
      
      // Handle specific error messages
      let errorMessage = 'Det oppstod en feil ved fjerning av oppskriften';
      
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
          errorMessage = 'Du har ikke tillatelse til å endre denne oppskriften. Vennligst logg inn på nytt.';
        }
      }
      
      Alert.alert('Feil', errorMessage);
    } finally {
      setRemovingRecipeId(null);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };
  
  // Apply filters to favorite recipes
  const filteredFavorites = useMemo(() => {
    if (!favoriteRecipes) return [];
    
    return favoriteRecipes.filter(savedRecipe => {
      const recipe = savedRecipe.recipe;
      if (!recipe) return false;
      
      // Filter by search term
      if (filters.searchTerm && !recipe.tittel.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by categories
      if (filters.selectedCategories.length > 0) {
        // Check if recipe has kategorier property and it's properly structured
        if (!recipe.kategorier) {
          return false;
        }
        
        // Ensure kategorier is an array
        if (!Array.isArray(recipe.kategorier)) {
          return false;
        }
        
        // Extract category IDs
        const recipeCategories = recipe.kategorier
          .filter(cat => cat && typeof cat === 'object' && cat._id)
          .map(cat => cat._id);
        
        // If recipe has no valid categories, filter it out
        if (recipeCategories.length === 0) {
          return false;
        }
        
        // Check if the recipe has any of the selected categories
        const hasMatchingCategory = filters.selectedCategories.some(catId => 
          recipeCategories.includes(catId)
        );
        
        if (!hasMatchingCategory) return false;
      }
      
      // Filter by calories
      if ((filters.calories.min > 0 && (recipe.totalKcal || 0) < filters.calories.min) || 
          (recipe.totalKcal || 0) > filters.calories.max) {
        return false;
      }
      
      // Filter by protein
      if ((filters.protein.min > 0 && (recipe.totalMakros?.protein || 0) < filters.protein.min) || 
          (recipe.totalMakros?.protein || 0) > filters.protein.max) {
        return false;
      }
      
      // Filter by carbs
      if ((filters.carbs.min > 0 && (recipe.totalMakros?.karbs || 0) < filters.carbs.min) || 
          (recipe.totalMakros?.karbs || 0) > filters.carbs.max) {
        return false;
      }
      
      // Filter by fat
      if ((filters.fat.min > 0 && (recipe.totalMakros?.fett || 0) < filters.fat.min) || 
          (recipe.totalMakros?.fett || 0) > filters.fat.max) {
        return false;
      }
      
      return true;
    });
  }, [favoriteRecipes, filters]);

  // Handle recipe click
  const handleRecipeClick = (recipeId: string) => {
    const colorName = getRecipeColor(recipeId).replace('bg-primary-', '');
    
    if (onRecipeSelect) {
      onRecipeSelect(recipeId, colorName);
    } else {
      router.push({
        pathname: '/recipes/[id]',
        params: { id: recipeId, color: colorName }
      });
    }
  };

  // Handle loading state
  if (localLoading && isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="mt-2 text-text-secondary">Laster favoritter...</Text>
      </View>
    );
  }

  // Handle error state
  if (localError || error) {
    const errorMessage = localError || error;
    const isAuthError = errorMessage?.includes('logget inn') || 
                        errorMessage?.includes('session') || 
                        !session?.user;
    
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons 
          name={isAuthError ? "person-circle-outline" : "alert-circle-outline"} 
          size={48} 
          color={isAuthError ? "#3C3C43" : "#FF6B6B"} 
        />
        <Text className="text-text-secondary text-center mt-4 text-lg">{errorMessage}</Text>
        
        {isAuthError ? (
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/sign-in')}
            className="mt-6 bg-primary-green px-6 py-3 rounded-lg"
          >
            <Text className="text-white">Logg inn</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => {
              setLocalLoading(true);
              setLocalError(null);
              refreshFavoriteRecipes().finally(() => setLocalLoading(false));
            }}
            className="mt-4 bg-primary-green px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Prøv igjen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Handle no favorites state
  if (!favoriteRecipes || favoriteRecipes.length === 0) {
    console.log("No favorite recipes found");
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="heart-outline" size={48} color="#3C3C43" />
        <Text className="text-text-secondary text-center mt-4 text-lg">Ingen favoritter ennå</Text>
        <Text className="text-text-secondary text-center mt-1">Lagre oppskrifter som favoritter for å se dem her</Text>
        <TouchableOpacity 
          onPress={() => {
            // Navigate to all recipes tab
            router.push('/recipes');
          }}
          className="mt-6 bg-primary-green px-6 py-3 rounded-lg"
        >
          <Text className="text-white">Utforsk oppskrifter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Filter section */}
      <View className="px-4 mb-4">
        <RecipeFilters 
          onFilterChange={handleFilterChange}
          maxValues={maxValues}
          ref={recipeFiltersRef}
        />
      </View>
      
      {/* Active filters display */}
      {(filters.searchTerm || 
        filters.selectedCategories.length > 0 || 
        filters.calories.min > 0 || 
        filters.calories.max < maxValues.calories || 
        filters.protein.min > 0 || 
        filters.protein.max < maxValues.protein || 
        filters.carbs.min > 0 || 
        filters.carbs.max < maxValues.carbs || 
        filters.fat.min > 0 || 
        filters.fat.max < maxValues.fat) && (
        <View className="flex-row justify-between items-center px-4 mb-2">
          <Text className="text-text-secondary">
            Viser {filteredFavorites.length} av {favoriteRecipes.length} favoritter
          </Text>
          <TouchableOpacity 
            onPress={() => {
              // Reset filters in parent component
              setFilters({
                searchTerm: '',
                selectedCategories: [],
                calories: { min: 0, max: maxValues.calories },
                protein: { min: 0, max: maxValues.protein },
                carbs: { min: 0, max: maxValues.carbs },
                fat: { min: 0, max: maxValues.fat }
              });
              
              // Call resetFilters directly on the RecipeFilters component
              if (recipeFiltersRef.current) {
                recipeFiltersRef.current.resetFilters();
              }
            }}
            className="bg-gray-200 rounded-lg px-3 py-1"
          >
            <Text className="text-gray-600">Tilbakestill filtre</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Recipe list */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2 space-y-4">
          {filteredFavorites.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Ionicons name="search-outline" size={48} color="#3C3C43" />
              <Text className="text-text-secondary text-center mt-4 text-lg">Ingen oppskrifter funnet</Text>
              <Text className="text-text-secondary text-center mt-1">Prøv å justere filtrene dine</Text>
            </View>
          ) : (
            filteredFavorites.map((savedRecipe, index) => {
              const recipe = savedRecipe.recipe;
              if (!recipe) return null;
              
              const bgColorClass = getColorForRecipe(recipe._id);
              // Extract just the color name without the 'bg-primary-' prefix
              const colorName = bgColorClass.replace('bg-primary-', '');
              
              return (
                <TouchableOpacity
                  key={savedRecipe.id}
                  className={`${bgColorClass} rounded-2xl shadow-sm overflow-hidden`}
                  onPress={() => handleRecipeClick(recipe._id)}
                >
                  <View className="relative">
                    <Image
                      source={getRecipeImageSource(recipe.image, 400, 200, recipe._id)}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                    
                    {/* Favorite button */}
                    <View className="absolute bottom-2 right-2">
                      <TouchableOpacity
                        onPress={(e) => unfavoriteRecipe(recipe._id, e)}
                        disabled={removingRecipeId === recipe._id}
                        className="bg-white rounded-full p-2 shadow"
                      >
                        <Ionicons 
                          name="heart" 
                          size={24} 
                          color="#FF6B6B" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="p-4">
                    <Text className="font-heading-serif text-xl mb-2 text-text-white">{recipe.tittel}</Text>
                    
                    {/* Categories */}
                    <View className="flex-row flex-wrap gap-2 mb-2">
                      {(recipe.kategorier || []).map((kategori) => (
                        <TouchableOpacity
                          key={kategori._id}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push({
                              pathname: '/category/[id]',
                              params: { id: kategori._id }
                            });
                          }}
                          className="bg-white/20 px-2 py-1 rounded-full"
                        >
                          <Text className="text-sm text-white">{kategori.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text className="text-text-white">Kalorier: {recipe.totalKcal || 0} kcal</Text>
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-text-white">Protein: {recipe.totalMakros?.protein || 0}g</Text>
                      <Text className="text-text-white">Karbohydrater: {recipe.totalMakros?.karbs || 0}g</Text>
                      <Text className="text-text-white">Fett: {recipe.totalMakros?.fett || 0}g</Text>
                    </View>
                    
                    {/* Notes if any */}
                    {savedRecipe.notes && (
                      <View className="mt-2 bg-white/10 p-2 rounded">
                        <Text className="text-white text-sm">{savedRecipe.notes}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FavoriteRecipes; 