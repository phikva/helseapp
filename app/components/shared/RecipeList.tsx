import React, { useRef, useState } from 'react';
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
  onToggleFavorite?: (recipe: any) => void;
  mode?: 'select' | 'view';
  viewMode?: 'grid' | 'list';
  showFavorites?: boolean;
};

const RecipeList = ({ 
  recipes, 
  isLoading, 
  error, 
  onRecipePress,
  onAddRecipe,
  onToggleFavorite,
  mode = 'select',
  viewMode = 'list',
  showFavorites = false
}: RecipeListProps) => {
  const { getRecipeColor } = useContentStore();
  
  // Keep track of the last used color
  const lastColorRef = useRef<string | null>(null);
  
  // Available colors for recipes (excluding 'light' as requested)
  const availableColors = ['green', 'cyan', 'purple', 'pink', 'blue'];
  
  // Enhanced color distribution with preference for pink and purple
  // This array has more occurrences of pink and purple to increase their frequency
  const weightedColors = ['green', 'cyan', 'purple', 'purple', 'pink', 'pink', 'blue'];

  // Local state to track favorites (for UI feedback before backend updates)
  const [localFavorites, setLocalFavorites] = useState<{[key: string]: boolean}>({});

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
  
  // Get a consistent color for a recipe based on its ID
  const getConsistentColor = (recipeId: string, index: number): string => {
    if (!recipeId) {
      // If no ID, use weighted distribution based on index
      return weightedColors[index % weightedColors.length];
    }
    
    // Use the recipe ID to generate a consistent color
    // This ensures the same recipe always gets the same color
    let hash = 0;
    for (let i = 0; i < recipeId.length; i++) {
      hash = recipeId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Get a positive number
    hash = Math.abs(hash);
    
    // Map to an index in our weighted colors array to favor pink and purple
    const colorIndex = hash % weightedColors.length;
    return weightedColors[colorIndex];
  };

  const handleToggleFavorite = (recipe: any, e: any) => {
    e.stopPropagation();
    // Update local state for immediate UI feedback
    setLocalFavorites(prev => ({
      ...prev,
      [recipe._id]: !prev[recipe._id]
    }));
    // Call the parent handler if provided
    if (onToggleFavorite) {
      onToggleFavorite(recipe);
    }
  };

  const renderGridItem = ({ item, index }: { item: any, index: number }) => {
    // Get a color that's different from the last one
    const colorName = getConsistentColor(item._id, index);
    const bgColor = colors.primary[colorName as keyof typeof colors.primary] || colors.primary.green;
    
    // Check if this recipe is favorited
    const isFavorite = item.isFavorite || localFavorites[item._id];
    
    return (
      <TouchableOpacity 
        style={[
          styles.gridCard, 
          { backgroundColor: bgColor }
        ]}
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
          
          {showFavorites && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => handleToggleFavorite(item, e)}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF4081" : "#FFFFFF"} 
              />
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
    // Get a color that's different from the last one
    const colorName = getConsistentColor(item._id, index);
    const bgColor = colors.primary[colorName as keyof typeof colors.primary] || colors.primary.green;
    
    // Check if this recipe is favorited
    const isFavorite = item.isFavorite || localFavorites[item._id];
    
    return (
      <TouchableOpacity 
        style={[
          styles.listCard, 
          { backgroundColor: bgColor }
        ]}
        onPress={() => onRecipePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listImageContainer}>
          <Image 
            source={getRecipeImageSource(item.image, 100, 100, item._id)}
            style={styles.listImage}
            resizeMode="cover"
          />
          
          {showFavorites && (
            <TouchableOpacity 
              style={styles.listFavoriteButton}
              onPress={(e) => handleToggleFavorite(item, e)}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite ? "#FF4081" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          )}
        </View>
        
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
      keyExtractor={(item) => item._id || `recipe-${Math.random()}`}
      contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
      renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
      numColumns={viewMode === 'grid' ? 1 : 1}
      removeClippedSubviews={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
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
  listImageContainer: {
    position: 'relative',
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
  
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 6,
  },
  
  listFavoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 4,
  },
});

export default RecipeList; 