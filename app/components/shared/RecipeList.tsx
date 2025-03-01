import React, { useRef } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../../lib/theme';
import { getRecipeImageSource } from '../../../lib/imageUtils';
import { useContentStore } from '../../../lib/store/contentStore';

type RecipeListProps = {
  recipes: any[];
  isLoading: boolean;
  error: string | null;
  onRecipePress: (recipe: any) => void;
  onAddRecipe: (recipe: any) => void;
  mode?: 'select' | 'view';
  viewMode?: 'grid' | 'list';
};

const RecipeList = ({ 
  recipes, 
  isLoading, 
  error, 
  onRecipePress,
  onAddRecipe,
  mode = 'select',
  viewMode = 'list'
}: RecipeListProps) => {
  const { getRecipeColor } = useContentStore();
  
  // Keep track of the last used color to avoid repeating colors
  const lastUsedColorRef = useRef<string | null>(null);
  
  // Available colors for recipes (excluding 'light' as requested)
  const availableColors = ['green', 'cyan', 'purple', 'pink', 'blue'];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
        <Text style={styles.loadingText}>Laster oppskrifter...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.text.secondary} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={50} color={colors.text.secondary} />
        <Text style={styles.emptyText}>Ingen oppskrifter funnet</Text>
      </View>
    );
  }
  
  // Function to get a color that's different from the last used one
  const getUniqueColor = (recipeId: string, index: number): string => {
    // Get the base color from the recipe ID
    let baseColor = getRecipeColor(recipeId);
    
    // If the color is 'light', replace it with a different color
    if (baseColor === 'light') {
      // Find a color that's not 'light'
      const otherColors = availableColors.filter(c => c !== 'light');
      // Use a deterministic approach to select a replacement color
      const hash = recipeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      baseColor = otherColors[hash % otherColors.length];
    }
    
    // If this color is the same as the last used color, pick a different one
    if (baseColor === lastUsedColorRef.current && availableColors.length > 1) {
      // Find colors that are not the last used color
      const otherColors = availableColors.filter(c => c !== lastUsedColorRef.current);
      // Use a deterministic approach to select a replacement color
      const hash = (recipeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index) % otherColors.length;
      baseColor = otherColors[hash];
    }
    
    // Update the last used color
    lastUsedColorRef.current = baseColor;
    
    return baseColor;
  };

  const renderGridItem = ({ item, index }: { item: any, index: number }) => {
    const colorName = getUniqueColor(item._id, index);
    const bgColor = colors.primary[colorName as keyof typeof colors.primary];
    
    return (
      <TouchableOpacity 
        style={[styles.gridCard, { backgroundColor: bgColor }]}
        onPress={() => onRecipePress(item)}
        activeOpacity={0.7}
      >
        <View>
          <Image 
            source={getRecipeImageSource(item.image, 400, 200, item._id)}
            style={styles.gridImage}
            resizeMode="cover"
          />
          
          {mode === 'select' && (
            <TouchableOpacity 
              style={styles.gridActionButton}
              onPress={(e) => {
                e.stopPropagation();
                onAddRecipe(item);
              }}
            >
              <Ionicons name="add-circle" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.gridInfo}>
          <Text style={styles.gridName}>{item.tittel}</Text>
          
          {/* Categories */}
          {item.kategorier && item.kategorier.length > 0 && (
            <View style={styles.categoriesContainer}>
              {item.kategorier.slice(0, 2).map((kategori: any) => (
                <View key={kategori._id} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{kategori.name}</Text>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.nutritionText}>Kalorier: {item.totalKcal || 0} kcal</Text>
          <View style={styles.macrosContainer}>
            <Text style={styles.nutritionText}>Protein: {item.totalMakros?.protein || 0}g</Text>
            <Text style={styles.nutritionText}>Karbs: {item.totalMakros?.karbs || 0}g</Text>
            <Text style={styles.nutritionText}>Fett: {item.totalMakros?.fett || 0}g</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item, index }: { item: any, index: number }) => {
    const colorName = getUniqueColor(item._id, index);
    const bgColor = colors.primary[colorName as keyof typeof colors.primary];
    
    return (
      <TouchableOpacity 
        style={[styles.listCard, { backgroundColor: bgColor }]}
        onPress={() => onRecipePress(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={getRecipeImageSource(item.image, 100, 100, item._id)}
          style={styles.listImage}
          resizeMode="cover"
        />
        
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.tittel}</Text>
          
          <View style={styles.listDetails}>
            <Text style={styles.listNutritionText}>Kalorier: {item.totalKcal || 0} kcal</Text>
            <Text style={styles.listNutritionText}>Protein: {item.totalMakros?.protein || 0}g</Text>
          </View>
        </View>
        
        {mode === 'select' ? (
          <TouchableOpacity 
            style={styles.listActionButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddRecipe(item);
            }}
          >
            <Ionicons name="add-circle" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.listActionButton}>
            <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item._id}
      contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
      renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
      numColumns={viewMode === 'grid' ? 1 : 1}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.body.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.body.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.body.medium,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  gridContent: {
    padding: 16,
  },
  
  // Grid view styles
  gridCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 180,
  },
  gridInfo: {
    padding: 16,
  },
  gridName: {
    fontSize: 18,
    fontFamily: fonts.heading.serif,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  nutritionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gridActionButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 4,
  },
  
  // List view styles
  listCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listImage: {
    width: 80,
    height: 80,
  },
  listInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 16,
    fontFamily: fonts.heading.serif,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listNutritionText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  listActionButton: {
    justifyContent: 'center',
    paddingRight: 12,
  },
});

export default RecipeList; 