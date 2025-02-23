import { StyleSheet, View, TouchableOpacity, SafeAreaView, Text, ScrollView, useWindowDimensions, Image } from 'react-native';
import { HelloWave } from '@components/HelloWave';
import { useAuthStore } from '@store/authStore';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { TopHeader } from '@components/ui/TopHeader';
import { client, urlFor } from '@/lib/sanity';
import { useRouter } from 'expo-router';
import HomeScreenSkeleton from '../components/skeleton/HomeScreenSkeleton';

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
    className="h-40 w-64 bg-white rounded-2xl mr-4 overflow-hidden shadow-sm"
  >
    <Image
      source={{ uri: urlFor(recipe.image).width(256).height(120).url() }}
      className="w-full h-24"
      resizeMode="cover"
    />
    <View className="p-2">
      <Text className="font-heading-medium text-body-large" numberOfLines={1}>
        {recipe.tittel}
      </Text>
      <Text className="text-text-secondary text-body-small">
        {recipe.totalKcal} kcal
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
      <Text className="font-heading-medium text-body-large" numberOfLines={1}>
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

  const fetchCategories = async () => {
    try {
      const query = `*[_type == "kategori"] {
        _id,
        name,
        description,
        image
      }`;
      const data = await client.fetch<Category[]>(query);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      const query = `*[_type == "oppskrift"] {
        _id,
        tittel,
        image,
        kategorier[]->{
          _id,
          name
        },
        totalKcal
      }`;
      const data = await client.fetch<Recipe[]>(query);
      // Randomly select 4 recipes for inspiration
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setInspirationalRecipes(shuffled.slice(0, 4));
      setPopularRecipes(data.slice(0, 4)); // First 4 recipes for popular
      setRecentRecipes(data.slice(-4)); // Last 4 recipes for recent
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchCategories(), fetchRecipes()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <HomeScreenSkeleton />;
  }

  const handleScroll = (event: any, setter: (index: number) => void, itemWidth: number) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / itemWidth);
    setter(currentIndex);
  };

  return (
    <SafeAreaView className="flex-1 bg-background pt-12">
      <TopHeader />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-8">
          {/* Categories Section */}
          <View className="flex-row items-center justify-between pt-4">
            <Text className="text-3xl font-heading-medium">Kategorier</Text>
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
            <Text className="text-3xl font-heading-medium mb-2">Trenger du inspirasjon?</Text>
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
            <Text className="text-3xl font-heading-medium mb-2">Populære oppskrifter</Text>
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
            <Text className="text-3xl font-heading-medium mb-2">Nyeste oppskrifter</Text>
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
