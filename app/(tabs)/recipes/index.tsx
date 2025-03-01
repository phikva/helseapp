import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Animated } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { urlFor } from '../../../lib/sanity';
import RecipeListSkeleton from '../../components/skeleton/RecipeListSkeleton';
import RecipeFilters from '../../components/RecipeFilters';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '../../../lib/store/contentStore';
import FavoriteRecipes from '../../components/FavoriteRecipes';
import { useAuthStore } from '../../../lib/store/authStore';
import { useSavedRecipesStore } from '../../../lib/store/savedRecipesStore';
import { saveRecipe, removeRecipe } from '../../../lib/services/savedRecipesService';
import { getRecipeImageSource } from '../../../lib/imageUtils';
import RecipeDrawer from '../../components/RecipeDrawer';
import { useToast } from '../../components/ui/Toast';
import CollapsibleHeader from '../../components/ui/CollapsibleHeader';
import AnimatedScrollView from '../../components/ui/AnimatedScrollView';

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
  tilberedningstid?: string;
}

interface FilterValues {
  searchTerm: string;
  selectedCategories: string[];
  calories: { min: number; max: number };
  protein: { min: number; max: number };
  carbs: { min: number; max: number };
  fat: { min: number; max: number };
}

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const router = useRouter();
  const { recipes, categories, isLoading: contentLoading, error: contentError, refreshContent, isCacheStale: isContentCacheStale, getRecipeColor } = useContentStore();
  const recipeFiltersRef = useRef<any>(null);
  const { session } = useAuthStore();
  const { savedRecipes, favoriteRecipes, refreshSavedRecipes, refreshFavoriteRecipes, isCacheStale } = useSavedRecipesStore();
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<{ id: string, color: string } | null>(null);
  const { showToast } = useToast();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerHeight, setHeaderHeight] = useState(75); // Default base header height
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get URL parameters
  const params = useLocalSearchParams();
  const { openRecipe, recipeColor, filterCategory, categoryName } = params;
  
  // Open drawer if navigating from home screen with recipe parameters
  useEffect(() => {
    if (openRecipe && typeof openRecipe === 'string') {
      const color = typeof recipeColor === 'string' ? recipeColor : 'green';
      setSelectedRecipe({ id: openRecipe, color });
      
      // Clear the URL parameters to prevent reopening on tab switch
      router.setParams({});
    }
  }, [openRecipe, recipeColor]);
  
  // Apply category filter if navigating from recipe drawer
  useEffect(() => {
    if (filterCategory && typeof filterCategory === 'string') {
      // Switch to the "all" tab if not already there
      setActiveTab('all');
      
      // Apply the category filter
      if (recipeFiltersRef.current) {
        recipeFiltersRef.current.applyCategoryFilter(filterCategory);
      } else {
        // If the ref isn't ready yet, update the filters directly
        setFilters(prev => ({
          ...prev,
          selectedCategories: [filterCategory]
        }));
      }
      
      // Clear the URL parameters to prevent reapplying on tab switch
      router.setParams({});
      
      // Show a toast or some indication that filters were applied
      if (categoryName && typeof categoryName === 'string') {
        console.log(`Filtered by category: ${categoryName}`);
      }
    }
  }, [filterCategory, categoryName]);
  
  // Filter state
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: '',
    selectedCategories: [],
    calories: { min: 0, max: 2000 },
    protein: { min: 0, max: 100 },
    carbs: { min: 0, max: 200 },
    fat: { min: 0, max: 100 }
  });
  
  // Max values for filters
  const [maxValues, setMaxValues] = useState({
    calories: 2000,
    protein: 100,
    carbs: 200,
    fat: 100
  });

  // Add a handler for header height changes with memoization
  const handleHeaderHeightChange = useMemo(() => (height: number) => {
    if (height !== headerHeight) {
      setHeaderHeight(height);
    }
  }, [headerHeight]);

  useEffect(() => {
    const loadRecipes = async () => {
      // Only show loading indicator if we don't have any recipes yet
      const shouldShowLoading = !recipes || recipes.length === 0;
      if (shouldShowLoading) {
        setLoading(true);
      }
      
      try {
        // Check if cache is stale and refresh if needed
        if (isContentCacheStale()) {
          await refreshContent();
        }
        
        // Calculate max values for filters based on actual data
        if (recipes && recipes.length > 0) {
          console.log('First recipe structure:', JSON.stringify(recipes[0], null, 2));
          
          // Check if recipes have categories
          const recipesWithCategories = recipes.filter(recipe => 
            recipe.kategorier && Array.isArray(recipe.kategorier) && recipe.kategorier.length > 0
          );
          console.log(`Recipes with categories: ${recipesWithCategories.length} out of ${recipes.length}`);
          
          if (recipesWithCategories.length > 0) {
            console.log('Sample recipe categories:', JSON.stringify(recipesWithCategories[0].kategorier, null, 2));
          } else {
            console.log('WARNING: No recipes have categories!');
            
            // Log all recipes to see their structure
            recipes.forEach((recipe, index) => {
              console.log(`Recipe ${index} (${recipe.tittel}) kategorier:`, 
                recipe.kategorier ? 
                  (Array.isArray(recipe.kategorier) ? 
                    (recipe.kategorier.length > 0 ? 
                      JSON.stringify(recipe.kategorier) : 
                      'Empty array') : 
                    'Not an array') : 
                  'Undefined');
            });
          }
          
          const maxCalories = Math.max(...recipes.map((recipe) => recipe.totalKcal || 0));
          const maxProtein = Math.max(...recipes.map((recipe) => recipe.totalMakros?.protein || 0));
          const maxCarbs = Math.max(...recipes.map((recipe) => recipe.totalMakros?.karbs || 0));
          const maxFat = Math.max(...recipes.map((recipe) => recipe.totalMakros?.fett || 0));
          
          const newMaxValues = {
            calories: Math.ceil(maxCalories / 100) * 100, // Round up to nearest 100
            protein: Math.ceil(maxProtein / 5) * 5, // Round up to nearest 5
            carbs: Math.ceil(maxCarbs / 10) * 10, // Round up to nearest 10
            fat: Math.ceil(maxFat / 5) * 5 // Round up to nearest 5
          };
          
          setMaxValues(newMaxValues);
          setFilters(prev => ({
            ...prev,
            calories: { min: 0, max: newMaxValues.calories },
            protein: { min: 0, max: newMaxValues.protein },
            carbs: { min: 0, max: newMaxValues.carbs },
            fat: { min: 0, max: newMaxValues.fat }
          }));
        }
      } catch (error) {
        console.error('Error loading recipes:', error);
        setError('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };
    
    // Start loading immediately, but don't block UI
    loadRecipes();
  }, [recipes, isContentCacheStale, refreshContent]);

  const handleFilterChange = (newFilters: FilterValues) => {
    console.log('Filter changed:', JSON.stringify(newFilters.selectedCategories));
    
    // Log the category names for better debugging
    if (newFilters.selectedCategories.length > 0 && categories) {
      const selectedCategoryNames = newFilters.selectedCategories.map(catId => {
        const category = categories.find(cat => cat._id === catId);
        return category ? `${category.name} (${catId})` : `Unknown (${catId})`;
      });
      console.log('Selected category names:', selectedCategoryNames);
    }
    
    setFilters(newFilters);
  };

  // Apply filters to recipes
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    
    console.log('Filtering recipes with categories:', filters.selectedCategories);
    
    return recipes.filter(recipe => {
      // Filter by search term
      if (filters.searchTerm && !recipe.tittel.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by categories - show recipes that have ANY of the selected categories
      if (filters.selectedCategories.length > 0) {
        // Check if recipe has kategorier property and it's properly structured
        if (!recipe.kategorier) {
          console.log(`Recipe "${recipe.tittel}" has no kategorier property`);
          return false;
        }
        
        // Ensure kategorier is an array
        if (!Array.isArray(recipe.kategorier)) {
          console.log(`Recipe "${recipe.tittel}" kategorier is not an array:`, recipe.kategorier);
          return false;
        }
        
        // Extract category IDs, handling potential missing _id fields
        const recipeCategories = recipe.kategorier
          .filter(cat => cat && typeof cat === 'object' && cat._id)
          .map(cat => cat._id);
        
        console.log('Recipe categories for', recipe.tittel, ':', recipeCategories);
        
        // If recipe has no valid categories, filter it out
        if (recipeCategories.length === 0) {
          console.log(`Recipe "${recipe.tittel}" has no valid categories`);
          return false;
        }
        
        // Check if the recipe has any of the selected categories
        const hasMatchingCategory = filters.selectedCategories.some(catId => 
          recipeCategories.includes(catId)
        );
        
        console.log(`Recipe "${recipe.tittel}" matches selected categories: ${hasMatchingCategory}`);
        
        if (!hasMatchingCategory) return false;
      }
      
      // Filter by calories - only if min > 0 or max < maxValue
      if ((filters.calories.min > 0 && (recipe.totalKcal || 0) < filters.calories.min) || 
          (recipe.totalKcal || 0) > filters.calories.max) {
        return false;
      }
      
      // Filter by protein - only if min > 0 or max < maxValue
      if ((filters.protein.min > 0 && (recipe.totalMakros?.protein || 0) < filters.protein.min) || 
          (recipe.totalMakros?.protein || 0) > filters.protein.max) {
        return false;
      }
      
      // Filter by carbs - only if min > 0 or max < maxValue
      if ((filters.carbs.min > 0 && (recipe.totalMakros?.karbs || 0) < filters.carbs.min) || 
          (recipe.totalMakros?.karbs || 0) > filters.carbs.max) {
        return false;
      }
      
      // Filter by fat - only if min > 0 or max < maxValue
      if ((filters.fat.min > 0 && (recipe.totalMakros?.fett || 0) < filters.fat.min) || 
          (recipe.totalMakros?.fett || 0) > filters.fat.max) {
        return false;
      }
      
      return true;
    });
  }, [recipes, filters]);

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

  // Helper function to get color for a recipe
  const getColorForRecipe = (recipeId: string) => {
    const colorName = getRecipeColor(recipeId);
    return `bg-primary-${colorName}`;
  };

  // Check if a recipe is saved as favorite
  const isRecipeFavorite = (recipeId: string) => {
    const savedRecipe = savedRecipes.find(sr => sr.recipe_id === recipeId);
    return savedRecipe?.is_favorite || false;
  };

  // Toggle favorite status
  const toggleFavorite = async (recipeId: string, event?: any) => {
    // Prevent the card click event from triggering
    if (event) {
      event.stopPropagation();
    }
    
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
    
    setSavingRecipeId(recipeId);
    
    // Check current favorite status
    const currentlyFavorite = isRecipeFavorite(recipeId);
    
    try {
      // Toggle the favorite status (true to add, false to remove)
      if (currentlyFavorite) {
        await removeRecipe(session.user.id, recipeId);
      } else {
        await saveRecipe(session.user.id, recipeId, true);
      }
      
      // Refresh both lists to ensure consistency across the app
      refreshSavedRecipes();
      refreshFavoriteRecipes();
      
      // Show toast instead of alert
      showToast({
        type: 'success',
        title: currentlyFavorite ? 'Fjernet fra favoritter' : 'Lagt til i favoritter',
        message: currentlyFavorite ? 'Oppskriften er fjernet fra favorittene dine' : 'Oppskriften er lagt til i favorittene dine'
      });
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
      
      // Show error toast instead of alert
      showToast({
        type: 'error',
        title: 'Feil',
        message: errorMessage
      });
    } finally {
      setSavingRecipeId(null);
    }
  };

  // Add a handler for removing individual filters
  const handleRemoveFilter = (filterName: string, filterValue: string) => {
    // Handle different filter types
    if (filterName === 'Kategorier') {
      // Extract category IDs to remove
      const categoryNames = filterValue.split(', ');
      const categoryIdsToRemove = categories
        ?.filter(cat => categoryNames.includes(cat.name))
        .map(cat => cat._id) || [];
      
      // Remove the selected categories
      setFilters(prev => ({
        ...prev,
        selectedCategories: prev.selectedCategories.filter(
          catId => !categoryIdsToRemove.includes(catId)
        )
      }));
      
      // Update the RecipeFilters component if it exists
      if (recipeFiltersRef.current?.updateSelectedCategories) {
        recipeFiltersRef.current.updateSelectedCategories(
          filters.selectedCategories.filter(
            catId => !categoryIdsToRemove.includes(catId)
          )
        );
      }
    } 
    // Handle numeric range filters
    else if (filterName === 'Kalorier') {
      setFilters(prev => ({
        ...prev,
        calories: { min: 0, max: maxValues.calories }
      }));
      if (recipeFiltersRef.current?.updateCalorieRange) {
        recipeFiltersRef.current.updateCalorieRange(0, maxValues.calories);
      }
    } 
    else if (filterName === 'Protein') {
      setFilters(prev => ({
        ...prev,
        protein: { min: 0, max: maxValues.protein }
      }));
      if (recipeFiltersRef.current?.updateProteinRange) {
        recipeFiltersRef.current.updateProteinRange(0, maxValues.protein);
      }
    } 
    else if (filterName === 'Karbohydrater') {
      setFilters(prev => ({
        ...prev,
        carbs: { min: 0, max: maxValues.carbs }
      }));
      if (recipeFiltersRef.current?.updateCarbsRange) {
        recipeFiltersRef.current.updateCarbsRange(0, maxValues.carbs);
      }
    } 
    else if (filterName === 'Fett') {
      setFilters(prev => ({
        ...prev,
        fat: { min: 0, max: maxValues.fat }
      }));
      if (recipeFiltersRef.current?.updateFatRange) {
        recipeFiltersRef.current.updateFatRange(0, maxValues.fat);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'favorites') => {
    // Reset scroll position
    scrollY.setValue(0);
    
    // Update active tab
    setActiveTab(tab);
  };

  if (loading || contentLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-light">
        <Stack.Screen 
          options={{
            headerShown: false
          }} 
        />
        <RecipeListSkeleton />
      </SafeAreaView>
    );
  }

  if (error || contentError) {
    return (
      <SafeAreaView className="flex-1 bg-primary-light">
        <Stack.Screen 
          options={{
            headerShown: false
          }} 
        />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center">{error || contentError}</Text>
          <TouchableOpacity 
            onPress={refreshContent}
            className="mt-4 bg-primary-green px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Prøv igjen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-primary-light">
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      {/* Collapsible Header with all elements */}
      <CollapsibleHeader
        scrollY={scrollY}
        title="Oppskrifter"
        searchTerm={filters.searchTerm}
        onSearchChange={(text) => {
          setFilters(prev => ({ ...prev, searchTerm: text }));
          if (recipeFiltersRef.current?.updateSearchTerm) {
            recipeFiltersRef.current.updateSearchTerm(text);
          }
        }}
        onFilterPress={() => {
          // Open the filter drawer using the ref
          if (recipeFiltersRef.current?.open) {
            recipeFiltersRef.current.open();
          }
        }}
        onResetFilters={() => {
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
        onRemoveFilter={handleRemoveFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasActiveFilters={
          filters.searchTerm !== '' || 
          filters.selectedCategories.length > 0 || 
          filters.calories.min > 0 || 
          filters.calories.max < maxValues.calories || 
          filters.protein.min > 0 || 
          filters.protein.max < maxValues.protein || 
          filters.carbs.min > 0 || 
          filters.carbs.max < maxValues.carbs || 
          filters.fat.min > 0 || 
          filters.fat.max < maxValues.fat
        }
        activeFilters={[
          // Category filters
          ...(filters.selectedCategories.length > 0 ? [{
            name: 'Kategorier',
            value: filters.selectedCategories.map(catId => {
              const category = categories?.find(c => c._id === catId);
              return category ? category.name : '';
            }).filter(Boolean).join(', ')
          }] : []),
          
          // Calorie filter
          ...(filters.calories.min > 0 || filters.calories.max < maxValues.calories ? [{
            name: 'Kalorier',
            value: `${filters.calories.min}-${filters.calories.max} kcal`
          }] : []),
          
          // Protein filter
          ...(filters.protein.min > 0 || filters.protein.max < maxValues.protein ? [{
            name: 'Protein',
            value: `${filters.protein.min}-${filters.protein.max} g`
          }] : []),
          
          // Carbs filter
          ...(filters.carbs.min > 0 || filters.carbs.max < maxValues.carbs ? [{
            name: 'Karbohydrater',
            value: `${filters.carbs.min}-${filters.carbs.max} g`
          }] : []),
          
          // Fat filter
          ...(filters.fat.min > 0 || filters.fat.max < maxValues.fat ? [{
            name: 'Fett',
            value: `${filters.fat.min}-${filters.fat.max} g`
          }] : [])
        ]}
        filteredCount={activeTab === 'all' ? filteredRecipes.length : filteredFavorites?.length}
        showFilters={showFilters}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        recipesCount={recipes?.length}
        favoritesCount={favoriteRecipes?.length}
      />
      
      {/* Content based on active tab */}
      {activeTab === 'all' ? (
        <AnimatedScrollView
          scrollY={scrollY}
          headerHeight={headerHeight}
          onHeaderHeightChange={handleHeaderHeightChange}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Recipe list */}
          <View className="px-4">
            {loading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text className="text-text-secondary text-center mt-4">Laster oppskrifter...</Text>
              </View>
            ) : !filteredRecipes || filteredRecipes.length === 0 ? (
              <View className="items-center justify-center py-10">
                <Ionicons name="search-outline" size={48} color="#3C3C43" />
                <Text className="text-text-secondary text-center mt-4 text-lg">Ingen oppskrifter funnet</Text>
                <Text className="text-text-secondary text-center mt-1">Prøv å justere filtrene dine</Text>
              </View>
            ) : (
              <View className={`${viewMode === 'grid' ? 'space-y-4' : 'space-y-2'} pb-20`}>
                {filteredRecipes.map((recipe, index) => {
                  const bgColorClass = getColorForRecipe(recipe._id);
                  // Extract just the color name without the 'bg-primary-' prefix
                  const colorName = bgColorClass.replace('bg-primary-', '');
                  const isFavorite = isRecipeFavorite(recipe._id);
                  
                  return viewMode === 'grid' ? (
                    // Grid View (existing card layout)
                    <TouchableOpacity
                      key={recipe._id}
                      className={`${bgColorClass} rounded-2xl shadow-sm overflow-hidden`}
                      onPress={() => {
                        setSelectedRecipe({ id: recipe._id, color: colorName });
                      }}
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
                            onPress={(e) => toggleFavorite(recipe._id, e)}
                            disabled={savingRecipeId === recipe._id}
                            className="bg-white rounded-full p-2 shadow"
                          >
                            <Ionicons 
                              name={isFavorite ? "heart" : "heart-outline"} 
                              size={24} 
                              color={isFavorite ? "#FF6B6B" : "#666"} 
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
                      </View>
                    </TouchableOpacity>
                  ) : (
                    // List View (new compact layout)
                    <TouchableOpacity
                      key={recipe._id}
                      className={`${bgColorClass} rounded-lg shadow-sm overflow-hidden flex-row`}
                      onPress={() => {
                        setSelectedRecipe({ id: recipe._id, color: colorName });
                      }}
                    >
                      <Image
                        source={getRecipeImageSource(recipe.image, 100, 100, recipe._id)}
                        className="w-24 h-24"
                        resizeMode="cover"
                      />
                      
                      <View className="flex-1 p-3 justify-center">
                        <Text className="font-heading-serif text-lg text-text-white">{recipe.tittel}</Text>
                        
                        <View className="flex-row items-center mt-1">
                          <Text className="text-text-white text-sm">Kalorier: {recipe.totalKcal || 0} kcal</Text>
                          <Text className="text-text-white text-sm ml-4">Protein: {recipe.totalMakros?.protein || 0}g</Text>
                        </View>
                      </View>
                      
                      {/* Favorite button */}
                      <View className="p-3 justify-center">
                        <TouchableOpacity
                          onPress={(e) => toggleFavorite(recipe._id, e)}
                          disabled={savingRecipeId === recipe._id}
                          className="bg-white/20 rounded-full p-2"
                        >
                          <Ionicons 
                            name={isFavorite ? "heart" : "heart-outline"} 
                            size={20} 
                            color={isFavorite ? "#FF6B6B" : "#fff"} 
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </AnimatedScrollView>
      ) : (
        <FavoriteRecipes 
          onRecipeSelect={(recipeId, colorName) => setSelectedRecipe({ id: recipeId, color: colorName })}
          scrollY={scrollY}
          headerHeight={headerHeight}
          searchTerm={filters.searchTerm}
          onSearchChange={(text) => {
            setFilters(prev => ({ ...prev, searchTerm: text }));
          }}
          showFilters={showFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeFilters={[
            // Category filters
            ...(filters.selectedCategories.length > 0 ? [{
              name: 'Kategorier',
              value: filters.selectedCategories.map(catId => {
                const category = categories?.find(c => c._id === catId);
                return category ? category.name : '';
              }).filter(Boolean).join(', ')
            }] : []),
            
            // Calorie filter
            ...(filters.calories.min > 0 || filters.calories.max < maxValues.calories ? [{
              name: 'Kalorier',
              value: `${filters.calories.min}-${filters.calories.max} kcal`
            }] : []),
            
            // Protein filter
            ...(filters.protein.min > 0 || filters.protein.max < maxValues.protein ? [{
              name: 'Protein',
              value: `${filters.protein.min}-${filters.protein.max} g`
            }] : []),
            
            // Carbs filter
            ...(filters.carbs.min > 0 || filters.carbs.max < maxValues.carbs ? [{
              name: 'Karbohydrater',
              value: `${filters.carbs.min}-${filters.carbs.max} g`
            }] : []),
            
            // Fat filter
            ...(filters.fat.min > 0 || filters.fat.max < maxValues.fat ? [{
              name: 'Fett',
              value: `${filters.fat.min}-${filters.fat.max} g`
            }] : [])
          ]}
          filteredCount={filteredFavorites?.length}
          hasActiveFilters={
            filters.searchTerm !== '' || 
            filters.selectedCategories.length > 0 || 
            filters.calories.min > 0 || 
            filters.calories.max < maxValues.calories || 
            filters.protein.min > 0 || 
            filters.protein.max < maxValues.protein || 
            filters.carbs.min > 0 || 
            filters.carbs.max < maxValues.carbs || 
            filters.fat.min > 0 || 
            filters.fat.max < maxValues.fat
          }
          onResetFilters={() => {
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
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
      
      {/* Recipe Drawer */}
      {selectedRecipe && (
        <RecipeDrawer
          recipeId={selectedRecipe.id}
          colorName={selectedRecipe.color}
          visible={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Hidden RecipeFilters component for the filter drawer */}
      <View style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}>
        <RecipeFilters 
          onFilterChange={handleFilterChange}
          maxValues={maxValues}
          ref={recipeFiltersRef}
        />
      </View>
    </View>
  );
}