import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { urlFor } from '@/lib/sanity';
import RecipeListSkeleton from '../../components/skeleton/RecipeListSkeleton';
import RecipeFilters from '../../components/RecipeFilters';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '../../../lib/store/contentStore';

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

interface FilterValues {
  searchTerm: string;
  selectedCategories: string[];
  calories: { min: number; max: number };
  protein: { min: number; max: number };
  carbs: { min: number; max: number };
  fat: { min: number; max: number };
}

// Array of Tailwind background color classes to cycle through
const bgColors = [
  'bg-primary-green',
  'bg-primary-cyan',
  'bg-primary-purple',
  'bg-primary-pink',
  'bg-primary-blue',
  'bg-primary-black',
];

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function RecipesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { recipes, categories, isLoading: contentLoading, error: contentError, refreshContent, isCacheStale } = useContentStore();
  const recipeFiltersRef = useRef<any>(null);
  
  // Generate shuffled colors array
  const shuffledColors = useMemo(() => shuffleArray(bgColors), []);
  
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

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      
      // Check if cache is stale and refresh if needed
      if (isCacheStale()) {
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
      
      setLoading(false);
    };
    
    loadRecipes();
  }, [recipes, isCacheStale, refreshContent]);

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

  // Helper function to get color for an index
  const getColorForIndex = (index: number) => {
    return shuffledColors[index % shuffledColors.length];
  };

  if (loading || contentLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-light pt-12">
        <Stack.Screen 
          options={{
            title: 'Oppskrifter',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#FCFCEC' },
            headerTitleStyle: { fontFamily: 'Montaga-Regular' },
          }} 
        />
        <RecipeListSkeleton />
      </SafeAreaView>
    );
  }

  if (error || contentError) {
    return (
      <SafeAreaView className="flex-1 bg-primary-light pt-12 pb-0">
        <Stack.Screen 
          options={{
            title: 'Oppskrifter',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#FCFCEC' },
            headerTitleStyle: { fontFamily: 'Montaga-Regular' },
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
    <SafeAreaView className="flex-1 bg-primary-light pt-10">
      <Stack.Screen 
        options={{
          title: 'Oppskrifter',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FCFCEC' },
          headerTitleStyle: { fontFamily: 'Montaga-Regular', fontSize: 32 },
        }} 
      />
      
      <View className="px-4">
        <RecipeFilters 
          onFilterChange={handleFilterChange}
          maxValues={maxValues}
          ref={recipeFiltersRef}
        />
      </View>
      
      <View className="px-4 mt-2 flex-row justify-between items-center">
        <Text className="body-regular text-text-secondary">
          {filteredRecipes?.length || 0} {(filteredRecipes?.length || 0) === 1 ? 'oppskrift' : 'oppskrifter'} funnet
        </Text>
        
        {/* Show reset all button if any filter is active */}
        {(filters.searchTerm || filters.selectedCategories.length > 0 || 
          filters.calories.max < maxValues.calories || 
          filters.protein.max < maxValues.protein || 
          filters.carbs.max < maxValues.carbs || 
          filters.fat.max < maxValues.fat) && (
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
            <Text className="text-text-secondary">Nullstill alle</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView className="flex-1 mt-2" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2">
          {!filteredRecipes || filteredRecipes.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Ionicons name="search-outline" size={48} color="#3C3C43" />
              <Text className="text-text-secondary text-center mt-4 text-lg">Ingen oppskrifter funnet</Text>
              <Text className="text-text-secondary text-center mt-1">Prøv å justere filtrene dine</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {filteredRecipes.map((recipe, index) => {
                const bgColorClass = getColorForIndex(index);
                // Extract just the color name without the 'bg-primary-' prefix
                const colorName = bgColorClass.replace('bg-primary-', '');
                
                return (
                  <TouchableOpacity
                    key={recipe._id}
                    className={`${bgColorClass} rounded-2xl shadow-sm overflow-hidden`}
                    onPress={() => {
                      router.push({
                        pathname: '/recipes/[id]',
                        params: { id: recipe._id, color: colorName }
                      });
                    }}
                  >
                    <Image
                      source={{ uri: recipe.image ? urlFor(recipe.image).width(400).height(200).url() : 'https://via.placeholder.com/400x200.png?text=No+Image' }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                    <View className="p-4">
                      <Text className="font-heading-serif text-xl mb-2 text-text-white">{recipe.tittel}</Text>
                      
                      {/* Categories */}
                      <View className="flex-row flex-wrap gap-2 mb-2">
                        {(recipe.kategorier || []).map((kategori) => (
                          <TouchableOpacity
                            key={kategori._id}
                            onPress={() => {
                              router.push({
                                pathname: '/categories/[id]',
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
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 