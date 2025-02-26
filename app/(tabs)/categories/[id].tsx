import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { client, urlFor } from '@/lib/sanity';
import { getCategoryWithRecipesQuery } from '@/lib/queries/categoryQueries';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../../components/ui/BackButton';
import { colors } from '../../../lib/theme';

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
      <Text className="font-heading-serif text-xl" numberOfLines={1}>
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
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
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
        <Text className="text-text-secondary">Kalorier: {recipe.totalKcal} kcal</Text>
        <View className="flex-row justify-between mt-2">
          <Text className="text-text-secondary">Protein: {recipe.totalMakros.protein}g</Text>
          <Text className="text-text-secondary">Karbohydrater: {recipe.totalMakros.karbs}g</Text>
          <Text className="text-text-secondary">Fett: {recipe.totalMakros.fett}g</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          {category.recipes.length} oppskrifter
        </Text>
      </View>
      
      <View className="px-4 mb-4 flex-row justify-end">
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-primary-green/20' : 'bg-gray-100'}`}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? colors.primary.green : colors.text.secondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-primary-green/20' : 'bg-gray-100'}`}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={viewMode === 'grid' ? colors.primary.green : colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {viewMode === 'list' ? (
          <View className="px-4">
            <View className="space-y-4 py-4">
              {category.recipes.map((recipe) => renderListCard(recipe))}
            </View>
          </View>
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
      </ScrollView>
    </SafeAreaView>
  );
} 