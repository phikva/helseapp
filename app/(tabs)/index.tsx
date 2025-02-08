import { Image, StyleSheet, Platform, View, Text, FlatList } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSanityQuery } from '@/hooks/useSanityQuery';
import { Post } from '@/types/sanity';

export default function HomeScreen() {
  const { data: posts, loading, error } = useSanityQuery<Post[]>(`
    *[_type == "post"] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt
    }
  `);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
