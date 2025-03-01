import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../../lib/theme';
import { useContentStore } from '../../../lib/store/contentStore';
import { useSavedRecipesStore } from '../../../lib/store/savedRecipesStore';
import { useToast } from '../../components/ui/Toast';
import RecipeFilters from '../RecipeFilters';
import RecipeList from './RecipeList';
import RecipeDrawer from '../RecipeDrawer';

type RecipeSelectorProps = {
  onSelectRecipe?: (recipe: any) => void;
  onClose: () => void;
  title?: string;
  showBackButton?: boolean;
  hideCategoryFilter?: boolean;
  initialSelectedCategory?: string;
  mode?: 'select' | 'view';
  showFavoritesTab?: boolean;
  initialViewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
};

const RecipeSelector = ({ 
  onSelectRecipe, 
  onClose, 
  title = 'Velg oppskrift',
  showBackButton = true,
  hideCategoryFilter = false,
  initialSelectedCategory,
  mode = 'select',
  showFavoritesTab = true,
  initialViewMode = 'list',
  onViewModeChange
}: RecipeSelectorProps) => {
  const router = useRouter();
  const { recipes, categories, isLoading: contentLoading, error: contentError, getRecipeColor } = useContentStore();
  const { favoriteRecipes, refreshFavoriteRecipes, isCacheStale, toggleFavorite } = useSavedRecipesStore();
  const toast = useToast();
  const recipeFiltersRef = useRef<any>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  
  // Recipe drawer state
  const [selectedRecipe, setSelectedRecipe] = useState<{ id: string, color: string } | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategories: initialSelectedCategory ? [initialSelectedCategory] : [],
    calories: { min: 0, max: 2000 },
    protein: { min: 0, max: 100 },
    carbs: { min: 0, max: 200 },
    fat: { min: 0, max: 100 }
  });
  
  // Max values for filters
  const [maxValues, setMaxValues] = useState({
    calories: 2000,
    protein: 100,
    carbs: 200,
    fat: 100
  });

  // Refresh favorites if cache is stale
  useEffect(() => {
    if (showFavoritesTab && isCacheStale()) {
      refreshFavoriteRecipes();
    }
  }, [showFavoritesTab, isCacheStale, refreshFavoriteRecipes]);

  useEffect(() => {
    // Calculate max values for filters based on actual data
    if (recipes && recipes.length > 0) {
      const maxCalories = Math.max(...recipes.map((recipe) => recipe.totalKcal || 0));
      const maxProtein = Math.max(...recipes.map((recipe) => recipe.totalMakros?.protein || 0));
      const maxCarbs = Math.max(...recipes.map((recipe) => recipe.totalMakros?.karbs || 0));
      const maxFat = Math.max(...recipes.map((recipe) => recipe.totalMakros?.fett || 0));
      
      const newMaxValues = {
        calories: Math.ceil(maxCalories / 100) * 100, // Round up to nearest 100
        protein: Math.ceil(maxProtein / 5) * 5, // Round up to nearest 5
        carbs: Math.ceil(maxCarbs / 10) * 10, // Round up to nearest 10
        fat: Math.ceil(maxFat / 5) * 5 // Round up to nearest 5
      };
      
      setMaxValues(newMaxValues);
      setFilters(prev => ({
        ...prev,
        calories: { min: 0, max: newMaxValues.calories },
        protein: { min: 0, max: newMaxValues.protein },
        carbs: { min: 0, max: newMaxValues.carbs },
        fat: { min: 0, max: newMaxValues.fat }
      }));
    }
  }, [recipes]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleRecipePress = (recipe: any) => {
    // When clicking the recipe card, open the recipe drawer to view details
    const colorName = getRecipeColor(recipe._id);
    setSelectedRecipe({ id: recipe._id, color: colorName });
  };

  const handleAddRecipe = (recipe: any) => {
    // When clicking the plus button or the "Add to Meal Plan" button in the drawer
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    }
    setSelectedRecipe(null);
  };

  // Toggle view mode between grid and list
  const toggleViewMode = () => {
    const newViewMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newViewMode);
    
    // Notify parent component if callback is provided
    if (onViewModeChange) {
      onViewModeChange(newViewMode);
    }
  };

  // Get filtered recipes
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];
    
    return recipes.filter(recipe => {
      // Filter by search term
      if (filters.searchTerm && !recipe.tittel.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by categories - show recipes that have ANY of the selected categories
      if (filters.selectedCategories.length > 0) {
        // Check if recipe has kategorier property and it's properly structured
        if (!recipe.kategorier || !Array.isArray(recipe.kategorier)) {
          return false;
        }
        
        // Extract category IDs, handling potential missing _id fields
        const recipeCategories = recipe.kategorier
          .filter(cat => cat && typeof cat === 'object' && cat._id)
          .map(cat => cat._id);
        
        // If recipe has no valid categories, filter it out
        if (recipeCategories.length === 0) {
          return false;
        }
        
        // Check if the recipe has any of the selected categories
        const hasMatchingCategory = filters.selectedCategories.some(catId => 
          recipeCategories.includes(catId)
        );
        
        if (!hasMatchingCategory) return false;
      }
      
      // Filter by calories
      if ((filters.calories.min > 0 && (recipe.totalKcal || 0) < filters.calories.min) || 
          (recipe.totalKcal || 0) > filters.calories.max) {
        return false;
      }
      
      // Filter by protein
      if ((filters.protein.min > 0 && (recipe.totalMakros?.protein || 0) < filters.protein.min) || 
          (recipe.totalMakros?.protein || 0) > filters.protein.max) {
        return false;
      }
      
      // Filter by carbs
      if ((filters.carbs.min > 0 && (recipe.totalMakros?.karbs || 0) < filters.carbs.min) || 
          (recipe.totalMakros?.karbs || 0) > filters.carbs.max) {
        return false;
      }
      
      // Filter by fat
      if ((filters.fat.min > 0 && (recipe.totalMakros?.fett || 0) < filters.fat.min) || 
          (recipe.totalMakros?.fett || 0) > filters.fat.max) {
        return false;
      }
      
      return true;
    });
  }, [recipes, filters]);

  // Handle toggling favorite status
  const handleToggleFavorite = (recipe: any) => {
    if (!recipe || !recipe._id) return;
    
    // Call the toggleFavorite function from the store
    toggleFavorite(recipe._id);
    
    // Show toast notification
    const isFavorite = favoriteRecipes.some(
      fav => fav.recipe_id === recipe._id && fav.is_favorite
    );
    
    if (isFavorite) {
      toast.showToast({
        type: 'info',
        message: 'Oppskrift fjernet fra favoritter',
      });
    } else {
      toast.showToast({
        type: 'success',
        message: 'Oppskrift lagt til i favoritter',
      });
    }
  };

  // Get favorite recipes
  const favoriteRecipesList = React.useMemo(() => {
    if (!favoriteRecipes || !recipes) return [];
    
    // Map favorite recipe IDs to full recipe objects
    return favoriteRecipes
      .filter(fav => fav.is_favorite)
      .map(fav => {
        const recipe = recipes.find(r => r._id === fav.recipe_id);
        if (recipe) {
          // Add isFavorite flag to recipe object for UI
          return { ...recipe, isFavorite: true };
        }
        return null;
      })
      .filter(recipe => !!recipe); // Filter out undefined recipes
  }, [favoriteRecipes, recipes]);

  // Add isFavorite flag to filtered recipes
  const enhancedFilteredRecipes = React.useMemo(() => {
    if (!filteredRecipes || !favoriteRecipes) return filteredRecipes;
    
    return filteredRecipes.map(recipe => {
      const isFavorite = favoriteRecipes.some(
        fav => fav.recipe_id === recipe._id && fav.is_favorite
      );
      return { ...recipe, isFavorite };
    });
  }, [filteredRecipes, favoriteRecipes]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary.green} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        
        {/* View Mode Toggle Button */}
        <TouchableOpacity 
          style={styles.viewModeButton}
          onPress={toggleViewMode}
        >
          <Ionicons 
            name={viewMode === 'grid' ? "list-outline" : "grid-outline"} 
            size={22} 
            color={colors.primary.green} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      {showFavoritesTab && (
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Alle oppskrifter ({filteredRecipes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favoritter ({favoriteRecipesList.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Filters - only show in "all" tab */}
      {activeTab === 'all' && (
        <RecipeFilters
          ref={recipeFiltersRef}
          onFilterChange={handleFilterChange}
          maxValues={maxValues}
          hideCategoryFilter={hideCategoryFilter}
        />
      )}
      
      {/* Recipe List */}
      <RecipeList 
        recipes={activeTab === 'all' ? enhancedFilteredRecipes : favoriteRecipesList}
        isLoading={contentLoading}
        error={contentError}
        onRecipePress={handleRecipePress}
        onAddRecipe={handleAddRecipe}
        mode={mode}
        viewMode={viewMode}
        showFavorites={true}
        onToggleFavorite={handleToggleFavorite}
      />
      
      {/* Recipe Drawer */}
      {selectedRecipe && (
        <RecipeDrawer
          recipeId={selectedRecipe.id}
          colorName={selectedRecipe.color}
          visible={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          showAddButton={mode === 'select'}
          onAddToMealPlan={recipe => {
            handleAddRecipe(recipe);
            setSelectedRecipe(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.light,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: fonts.heading.serif,
    color: colors.text.DEFAULT,
    textAlign: 'center',
  },
  viewModeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.green,
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.body.medium,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary.green,
  },
  categoryIndicator: {
    backgroundColor: colors.primary.light,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: fonts.body.medium,
    color: colors.primary.green,
  },
});

export default RecipeSelector; 