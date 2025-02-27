import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '../../lib/sanity';
import { getCategoryWithRecipesQuery } from '../../lib/queries/categoryQueries';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BackButton } from '../../components/ui/BackButton';
import RecipeFilters from '../components/RecipeFilters';
import { colors } from '../../lib/theme';
import { Ionicons } from '@expo/vector-icons';

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

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    fetchCategory();
  }, [id]);

  useEffect(() => {
    if (category) {
      applyFilters();
    }
  }, [category, filters]);

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

  const applyFilters = () => {
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
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  // Calculate max values for filters based on recipes
  const getMaxValues = () => {
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
        <BackButton />
      </View>
    );
  }

  const recipesToDisplay = filteredRecipes.length > 0 ? filteredRecipes : category.recipes;

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={category.name} />
      
      <ScrollView>
        <Image
          source={{ uri: urlFor(category.image).width(400).height(200).url() }}
          className="w-full h-48"
          resizeMode="cover"
        />
        
        <View className="p-4">
          <Text className="text-2xl font-bold mb-4">{category.name} Recipes</Text>
          
          {/* Recipe Filters */}
          <View className="mb-4">
            <RecipeFilters 
              ref={filtersRef}
              onFilterChange={handleFilterChange}
              maxValues={getMaxValues()}
            />
          </View>
          
          {/* Recipe Count */}
          <Text className="text-gray-600 mb-4">
            {recipesToDisplay.length} {recipesToDisplay.length === 1 ? 'recipe' : 'recipes'} found
          </Text>
          
          <View className="space-y-4">
            {recipesToDisplay.length > 0 ? (
              recipesToDisplay.map((recipe) => (
                <TouchableOpacity
                  key={recipe._id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                  onPress={() => {
                    router.push({
                      pathname: '/recipe/[id]',
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
              ))
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 text-center">No recipes match your filters</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 