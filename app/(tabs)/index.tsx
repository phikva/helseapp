import { StyleSheet, View, TouchableOpacity, SafeAreaView, Text, ScrollView, useWindowDimensions, Image } from 'react-native';
import { HelloWave } from '@components/HelloWave';
import { useAuthStore } from '@store/authStore';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { TopHeader } from '@components/ui/TopHeader';
import { client, urlFor } from '@/lib/sanity';
import { useRouter } from 'expo-router';
import HomeScreenSkeleton from '../components/skeleton/HomeScreenSkeleton'
import { colors } from '../../lib/theme';
import { useContentStore } from '../../lib/store/contentStore';

interface Recipe {
  _id: string;
  tittel: string;
  image: string;
  kategorier: Array<{
    _id: string;
    name: string;
  }>;
  totalKcal: number;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

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
    className="h-40 w-64 bg-white rounded-2xl mr-4 overflow-hidden shadow-sm"
  >
    <Image
      source={{ uri: recipe.image ? urlFor(recipe.image).width(256).height(120).url() : 'https://via.placeholder.com/256x120.png?text=No+Image' }}
      className="w-full h-24"
      resizeMode="cover"
    />
    <View className="p-2">
      <Text className="font-heading-serif text-body-large" numberOfLines={1}>
        {recipe.tittel}
      </Text>
      <Text className="text-text-secondary text-body-small">
        {recipe.totalKcal || 0} kcal
      </Text>
    </View>
  </TouchableOpacity>
);

// Category Card Component
const CategoryCard = ({ category, onPress }: { category: Category; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="h-48 w-80 bg-white rounded-2xl mr-4 overflow-hidden shadow-sm"
  >
    {category.image && (
      <Image
        source={{ uri: urlFor(category.image).width(320).height(140).url() }}
        className="w-full h-32"
        resizeMode="cover"
      />
    )}
    <View className="p-3">
      <Text className="font-heading-serif text-2xl" numberOfLines={1}>
        {category.name}
      </Text>
      {category.description && (
        <Text className="text-text-secondary text-body-small" numberOfLines={2}>
          {category.description}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { signOut } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeeklyPlan, setCurrentWeeklyPlan] = useState(0);
  const [currentRecipes, setCurrentRecipes] = useState(0);
  const [currentFoodRecipes, setCurrentFoodRecipes] = useState(0);
  const [currentCategories, setCurrentCategories] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [inspirationalRecipes, setInspirationalRecipes] = useState<Recipe[]>([]);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { recipes, categories: cachedCategories, isLoading: contentLoading, refreshContent, isCacheStale } = useContentStore();

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      
      // Check if cache is stale and refresh if needed
      if (isCacheStale()) {
        await refreshContent();
      }
      
      // Set categories from cache
      setCategories(cachedCategories || []);
      
      // Process recipes for different sections
      if (recipes && recipes.length > 0) {
        // Randomly select 4 recipes for inspiration
        const shuffled = [...recipes].sort(() => 0.5 - Math.random());
        setInspirationalRecipes(shuffled.slice(0, 4));
        setPopularRecipes(recipes.slice(0, 4)); // First 4 recipes for popular
        setRecentRecipes(recipes.slice(-4)); // Last 4 recipes for recent
      }
      
      setIsLoading(false);
    };
    
    loadContent();
  }, [recipes, cachedCategories, isCacheStale, refreshContent]);

  if (isLoading || contentLoading) {
    return <HomeScreenSkeleton />;
  }

  const handleScroll = (event: any, setter: (index: number) => void, itemWidth: number) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / itemWidth);
    setter(currentIndex);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary.light, paddingTop: 48 }}>
      <TopHeader />
      <View style={{ height: 24, backgroundColor: '#FCFCEC' }} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-8">
          {/* Categories Section */}
          <View className="flex-row items-center justify-between pt-4">
            <Text className="text-4xl font-heading-serif">Kategorier</Text>
          </View>

          <View className="mt-4">
            <Text className="body-regular text-lg text-text-secondary">Utforsk oppskrifter etter kategori</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mt-2"
              onScroll={(e) => handleScroll(e, setCurrentCategories, 320 + 16)}
              scrollEventThrottle={16}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={320 + 16}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onPress={() => router.push(`/categories/${category._id}`)}
                />
              ))}
            </ScrollView>
            <PaginationDots total={categories.length} current={currentCategories} />
          </View>

          {/* Inspiration Section */}
          <View className="mt-6">
            <Text className="text-4xl font-heading-serif mb-2">Trenger du inspirasjon?</Text>
            <Text className="body-regular text-lg text-text-secondary mb-2">Bli inspirert av disse oppskriftene</Text>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, setCurrentRecipes, 256 + 16)}
              scrollEventThrottle={16}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={256 + 16}
            >
              {inspirationalRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onPress={() => router.push(`/recipes/${recipe._id}`)}
                />
              ))}
            </ScrollView>
            <PaginationDots total={inspirationalRecipes.length} current={currentRecipes} />
          </View>

          {/* Popular Recipes Section */}
          <View className="mt-6">
            <Text className="text-4xl font-heading-serif mb-2">Populære oppskrifter</Text>
            <Text className="body-regular text-lg text-text-secondary mb-2">De mest populære oppskriftene</Text>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, setCurrentFoodRecipes, 256 + 16)}
              scrollEventThrottle={16}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={256 + 16}
            >
              {popularRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onPress={() => router.push(`/recipes/${recipe._id}`)}
                />
              ))}
            </ScrollView>
            <PaginationDots total={popularRecipes.length} current={currentFoodRecipes} />
          </View>

          {/* Recent Recipes Section */}
          <View className="mt-6 mb-6">
            <Text className="text-4xl font-heading-serif mb-2">Nyeste oppskrifter</Text>
            <Text className="body-regular text-lg text-text-secondary mb-2">Nylig lagt til</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, setCurrentWeeklyPlan, 256 + 16)}
              scrollEventThrottle={16}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={256 + 16}
            >
              {recentRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onPress={() => router.push(`/recipes/${recipe._id}`)}
                />
              ))}
            </ScrollView>
            <PaginationDots total={recentRecipes.length} current={currentWeeklyPlan} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
