import { StyleSheet, View, TouchableOpacity, SafeAreaView, Text, ScrollView, useWindowDimensions } from 'react-native';
import { HelloWave } from '@components/HelloWave';
import { useAuthStore } from '@store/authStore';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { TopHeader } from '@components/ui/TopHeader';

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

export default function HomeScreen() {
  const { signOut } = useAuthStore();
  const [currentWeeklyPlan, setCurrentWeeklyPlan] = useState(0);
  const [currentRecipes, setCurrentRecipes] = useState(0);
  const [currentFoodRecipes, setCurrentFoodRecipes] = useState(0);
  const { width } = useWindowDimensions();

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
          {/* Main Header */}
          <View className="flex-row items-center justify-between pt-4">
            <Text className="text-3xl font-heading-medium">Min ukesplan</Text>
          </View>

          {/* Weekly Plan Carousel */}
          <View className="mt-4">
            <Text className="body-regular text-lg text-text-secondary">Sett opp din ukesplan</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mt-2"
              onScroll={(e) => handleScroll(e, setCurrentWeeklyPlan, 320 + 16)} // width + margin
              scrollEventThrottle={16}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={320 + 16}
            >
              {[1, 2, 3].map((item) => (
                <View 
                  key={item} 
                  className="h-48 w-80 bg-gray-200 rounded-2xl mr-4"
                />
              ))}
            </ScrollView>
            <PaginationDots total={3} current={currentWeeklyPlan} />
          </View>

          {/* Recipes Carousel */}
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
              {[1, 2, 3, 4].map((item) => (
                <View 
                  key={item} 
                  className="h-40 w-64 bg-gray-200 rounded-2xl mr-4"
                />
              ))}
            </ScrollView>
            <PaginationDots total={4} current={currentRecipes} />
          </View>

          {/* Food Recipes Carousel */}
          <View className="mt-6 mb-6">
            <Text className="text-3xl font-heading-medium mb-2">Matoppskrifter</Text>
            <Text className="body-regular text-lg text-text-secondary mb-2">Dine matoppskrifter</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, setCurrentFoodRecipes, 256 + 16)}
              scrollEventThrottle={16}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={256 + 16}
            >
              {[1, 2, 3, 4].map((item) => (
                <View 
                  key={item} 
                  className="h-40 w-64 bg-gray-200 rounded-2xl mr-4"
                />
              ))}
            </ScrollView>
            <PaginationDots total={4} current={currentFoodRecipes} />
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
