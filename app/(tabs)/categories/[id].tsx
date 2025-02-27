import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '@/lib/sanity';
import { getCategoryWithRecipesQuery } from '@/lib/queries/categoryQueries';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../../components/ui/BackButton';
import { colors } from '../../../lib/theme';
import RecipeFilters from '../../components/RecipeFilters';
import { useContentStore } from '../../../lib/store/contentStore';

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

interface FilterValues {
  searchTerm: string;
  selectedCategories: string[];
  calories: { min: number; max: number };
  protein: { min: number; max: number };
  carbs: { min: number; max: number };
  fat: { min: number; max: number };
}

const { width: screenWidth } = Dimensions.get('window');

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

// Pagination component
const PaginationDots = ({ total, current }: { total: number; current: number }) => (
  <View className="flex-row justify-center space-x-1 mt-2">
    {Array.from({ length: total }).map((_, index) => (
      <View
        key={index}
        style={{
          height: 8,
          borderRadius: 4,
          width: index === current ? 24 : 8,
          backgroundColor: index === current ? colors.primary.green : '#D1D1D6',
          marginHorizontal: 2
        }}
      />
    ))}
  </View>
);

// Recipe Card Component
const RecipeCard = ({ recipe, onPress, colorClass }: { recipe: Recipe; onPress: () => void; colorClass: string }) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`h-64 w-80 ${colorClass} rounded-2xl mr-4 overflow-hidden shadow-sm`}
  >
    <Image
      source={{ uri: urlFor(recipe.image).width(320).height(200).url() }}
      className="w-full h-40"
      resizeMode="cover"
    />
    <View className="p-4">
      <Text className="font-heading-serif text-xl text-text-white" numberOfLines={1}>
        {recipe.tittel}
      </Text>
      <Text className="text-text-white text-lg mt-1">
        {recipe.totalKcal} kcal
      </Text>
    </View>
  </TouchableOpacity>
);

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentRecipe, setCurrentRecipe] = useState(0);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: '',
    selectedCategories: [],
    calories: { min: 0, max: 5000 },
    protein: { min: 0, max: 200 },
    carbs: { min: 0, max: 200 },
    fat: { min: 0, max: 200 }
  });
  const filtersRef = useRef(null);

  // Generate shuffled colors array
  const shuffledColors = useMemo(() => shuffleArray(bgColors), []);
  
  // Helper function to get color for an index
  const getColorForIndex = (index: number) => {
    return shuffledColors[index % shuffledColors.length];
  };

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

  // Memoize the applyFilters function to prevent unnecessary recreations
  const applyFilters = useCallback(() => {
    if (!category) return;

    let result = [...category.recipes];

    // Apply search term filter
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      result = result.filter(recipe => 
        recipe.tittel.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply calorie filter
    if (filters.calories.max < 5000) {
      result = result.filter(recipe => 
        recipe.totalKcal <= filters.calories.max
      );
    }

    // Apply protein filter
    if (filters.protein.max < 200) {
      result = result.filter(recipe => 
        recipe.totalMakros.protein <= filters.protein.max
      );
    }

    // Apply carbs filter
    if (filters.carbs.max < 200) {
      result = result.filter(recipe => 
        recipe.totalMakros.karbs <= filters.carbs.max
      );
    }

    // Apply fat filter
    if (filters.fat.max < 200) {
      result = result.filter(recipe => 
        recipe.totalMakros.fett <= filters.fat.max
      );
    }

    setFilteredRecipes(result);
  }, [category, filters]);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  // Only apply filters when category or filters change
  useEffect(() => {
    if (category) {
      applyFilters();
    }
  }, [applyFilters]);

  // Memoize the max values to prevent unnecessary recalculations
  const maxValues = useMemo(() => {
    if (!category || !category.recipes.length) {
      return {
        calories: 5000,
        protein: 200,
        carbs: 200,
        fat: 200
      };
    }

    return {
      calories: Math.max(...category.recipes.map(r => r.totalKcal || 0)) + 100,
      protein: Math.max(...category.recipes.map(r => r.totalMakros?.protein || 0)) + 20,
      carbs: Math.max(...category.recipes.map(r => r.totalMakros?.karbs || 0)) + 20,
      fat: Math.max(...category.recipes.map(r => r.totalMakros?.fett || 0)) + 20
    };
  }, [category]);

  const handleFilterChange = (newFilters: FilterValues) => {
    // Prevent unnecessary re-renders by checking if filters actually changed
    setFilters(prevFilters => {
      // Ignore category filter changes since we're already in a category
      const updatedFilters = {
        ...newFilters,
        selectedCategories: [] // Always keep this empty for category screen
      };
      
      if (
        prevFilters.searchTerm === updatedFilters.searchTerm &&
        prevFilters.calories.max === updatedFilters.calories.max &&
        prevFilters.protein.max === updatedFilters.protein.max &&
        prevFilters.carbs.max === updatedFilters.carbs.max &&
        prevFilters.fat.max === updatedFilters.fat.max
      ) {
        return prevFilters; // No change, return previous state
      }
      return updatedFilters; // Return new filters if there's a change
    });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / (320 + 16));
    setCurrentRecipe(currentIndex);
  };

  const renderListCard = (recipe: Recipe, index: number) => {
    const bgColorClass = getColorForIndex(index);
    // Extract just the color name without the 'bg-primary-' prefix
    const colorName = bgColorClass.replace('bg-primary-', '');
    
    return (
      <TouchableOpacity
        key={recipe._id}
        className={`${bgColorClass} rounded-2xl shadow-sm overflow-hidden mb-4`}
        onPress={() => {
          router.push({
            pathname: '/recipes/[id]',
            params: { id: recipe._id, color: colorName }
          });
        }}
      >
        <Image
          source={{ uri: urlFor(recipe.image).width(400).height(200).url() }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="font-heading-serif text-xl mb-2 text-text-white">{recipe.tittel}</Text>
          <Text className="text-text-white">Kalorier: {recipe.totalKcal} kcal</Text>
          <View className="flex-row justify-between mt-2">
            <Text className="text-text-white">Protein: {recipe.totalMakros.protein}g</Text>
            <Text className="text-text-white">Karbohydrater: {recipe.totalMakros.karbs}g</Text>
            <Text className="text-text-white">Fett: {recipe.totalMakros.fett}g</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48 }}>
        <Stack.Screen 
          options={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.primary.light },
            headerLeft: () => <BackButton onPress={() => router.back()} />,

          }} 
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary.green} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !category) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48 }}>
        <Stack.Screen 
          options={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.primary.light },
            headerLeft: () => <BackButton onPress={() => router.back()} />,
            headerTitle: () => (
              <View style={{ height: 40 }}>
                <Text style={{ fontFamily: 'Montaga-Regular' }}>Kategori</Text>
              </View>
            ),
          }} 
        />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center">{error || 'Fant ikke kategorien'}</Text>
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

  // Calculate recipesToDisplay inside the render function
  const recipesToDisplay = filteredRecipes.length > 0 ? filteredRecipes : category.recipes;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 0 }}>
      <Stack.Screen 
        options={{
          title: category.name,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.primary.light },
          headerTitleStyle: { fontFamily: 'Montaga-Regular', fontSize: 32 },
          headerLeft: () => <BackButton onPress={() => router.back()} />,
        }} 
      />
      
      <View className="px-4 pt-1">
        <Text className="text-5xl font-heading-serif mb-1">{category.name}</Text>
        <Text className="body-regular text-lg text-text-secondary mb-2">
          {recipesToDisplay.length} oppskrifter
        </Text>
      </View>
      
      {/* Recipe Filters */}
      <View className="px-4 mb-0">
        {category && (
          <RecipeFilters 
            ref={filtersRef}
            onFilterChange={handleFilterChange}
            maxValues={maxValues}
            hideCategoryFilter={true}
          />
        )}
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {viewMode === 'list' ? (
          <View className="px-4">
            <View className="space-y-4 py-4">
              {recipesToDisplay.length > 0 ? (
                recipesToDisplay.map((recipe, index) => renderListCard(recipe, index))
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">No recipes match your filters</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center">
            <View className="px-4">
              {recipesToDisplay.length > 0 ? (
                <>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => handleScroll(e)}
                    scrollEventThrottle={16}
                    pagingEnabled
                    decelerationRate="fast"
                    snapToInterval={320 + 16}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                  >
                    {recipesToDisplay.map((recipe, index) => {
                      const colorClass = getColorForIndex(index);
                      const colorName = colorClass.replace('bg-primary-', '');
                      return (
                        <RecipeCard
                          key={recipe._id}
                          recipe={recipe}
                          colorClass={colorClass}
                          onPress={() => router.push({
                            pathname: '/recipes/[id]',
                            params: { id: recipe._id, color: colorName }
                          })}
                        />
                      );
                    })}
                  </ScrollView>
                  <View className="mt-6">
                    <PaginationDots total={recipesToDisplay.length} current={currentRecipe} />
                  </View>
                </>
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">No recipes match your filters</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 