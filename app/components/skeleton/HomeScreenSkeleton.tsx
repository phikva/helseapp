import { View, ScrollView, SafeAreaView } from 'react-native';

const CategoryCardSkeleton = () => (
  <View className="h-48 w-80 bg-white rounded-2xl mr-4 overflow-hidden shadow-sm">
    <View className="w-full h-32 bg-gray-200" />
    <View className="p-3">
      <View className="w-3/4 h-6 mb-2 bg-gray-200 rounded" />
      <View className="w-1/2 h-4 bg-gray-200 rounded" />
    </View>
  </View>
);

const RecipeCardSkeleton = () => (
  <View className="h-40 w-64 bg-white rounded-2xl mr-4 overflow-hidden shadow-sm">
    <View className="w-full h-24 bg-gray-200" />
    <View className="p-2">
      <View className="w-3/4 h-6 mb-2 bg-gray-200 rounded" />
      <View className="w-1/3 h-4 bg-gray-200 rounded" />
    </View>
  </View>
);

const SectionHeaderSkeleton = () => (
  <View className="mb-2">
    <View className="w-48 h-8 mb-2 bg-gray-200 rounded" />
    <View className="w-64 h-6 bg-gray-200 rounded" />
  </View>
);

export default function HomeScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background pt-12">
      <View className="h-16 px-4">
        <View className="w-32 h-8 bg-gray-200 rounded" />
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-8">
          {/* Categories Section */}
          <View className="pt-4">
            <SectionHeaderSkeleton />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mt-2"
            >
              {[1, 2, 3].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </ScrollView>
          </View>

          {/* Inspiration Section */}
          <View className="mt-6">
            <SectionHeaderSkeleton />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
            >
              {[1, 2, 3, 4].map((i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </ScrollView>
          </View>

          {/* Popular Recipes Section */}
          <View className="mt-6">
            <SectionHeaderSkeleton />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
            >
              {[1, 2, 3, 4].map((i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </ScrollView>
          </View>

          {/* Recent Recipes Section */}
          <View className="mt-6 mb-6">
            <SectionHeaderSkeleton />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
            >
              {[1, 2, 3, 4].map((i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 