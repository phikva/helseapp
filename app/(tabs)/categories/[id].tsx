import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '@/lib/sanity';
import { getCategoryWithRecipesQuery } from '@/lib/queries/categoryQueries';
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

const { width: screenWidth } = Dimensions.get('window');

// Pagination component
const PaginationDots = ({ total, current }: { total: number; current: number }) => (
  <View className="flex-row justify-center space-x-1 mt-2">
    {Array.from({ length: total }).map((_, index) => (
      <View
        key={index}
        className={`h-1.5 rounded-full ${
          index === current 
            ? 'w-4 bg-primary-Green' 
            : 'w-1.5 bg-gray-300'
        }`}
      />
    ))}
  </View>
);

// Recipe Card Component
const RecipeCard = ({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="h-64 w-80 bg-white rounded-2xl mr-4 overflow-hidden shadow-sm"
  >
    <Image
      source={{ uri: urlFor(recipe.image).width(320).height(200).url() }}
      className="w-full h-40"
      resizeMode="cover"
    />
    <View className="p-4">
      <Text className="font-heading-medium text-xl" numberOfLines={1}>
        {recipe.tittel}
      </Text>
      <Text className="text-text-secondary text-lg mt-1">
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

  useEffect(() => {
    fetchCategory();
  }, [id]);

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

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / (320 + 16));
    setCurrentRecipe(currentIndex);
  };

  const renderListCard = (recipe: Recipe) => (
    <TouchableOpacity
      key={recipe._id}
      className="bg-white rounded-lg shadow-md overflow-hidden mb-4"
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
        <Text className="text-gray-600">Kalorier: {recipe.totalKcal} kcal</Text>
        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-600">Protein: {recipe.totalMakros.protein}g</Text>
          <Text className="text-gray-600">Karbohydrater: {recipe.totalMakros.karbs}g</Text>
          <Text className="text-gray-600">Fett: {recipe.totalMakros.fett}g</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text className="text-red-500 text-center">{error || 'Kategori ikke funnet'}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-cyan-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Gå tilbake</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          title: category.name,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'white' },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <Ionicons name="chevron-back" size={24} color="#0891b2" />
              <Text className="text-cyan-600 ml-1">Tilbake</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View className="px-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">{category.name} oppskrifter</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-cyan-100' : 'bg-gray-100'}`}
            >
              <Ionicons 
                name="list" 
                size={24} 
                color={viewMode === 'list' ? '#0891b2' : '#666'} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-100' : 'bg-gray-100'}`}
            >
              <Ionicons 
                name="grid" 
                size={24} 
                color={viewMode === 'grid' ? '#0891b2' : '#666'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {viewMode === 'list' ? (
        <ScrollView className="flex-1 px-4">
          <View className="space-y-4 py-4">
            {category.recipes.map((recipe) => renderListCard(recipe))}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center">
          <View className="px-4">
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
              {category.recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onPress={() => router.push(`/recipes/${recipe._id}`)}
                />
              ))}
            </ScrollView>
            <View className="mt-6">
              <PaginationDots total={category.recipes.length} current={currentRecipe} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
} 