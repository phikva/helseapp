import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, fonts } from '../../../lib/theme';
import { GENERIC_MEAL_TYPES } from './types';
import { Recipe } from './types';
import { client } from '../../../lib/sanity';
import { getAllRecipesQuery } from '../../../lib/queries/recipeQueries';

type RecipeSelectorProps = {
  recipes: Recipe[];
  selectedDay: string;
  selectedMealType: string;
  onSelectRecipe: (recipe: Recipe) => void;
  onClose: () => void;
  onViewRecipeDetails: (recipe: Recipe) => void;
  mealPlan: {
    [day: string]: {
      [mealId: string]: Recipe | null;
    };
  };
};

const RecipeSelector = ({ 
  recipes: initialRecipes, 
  selectedDay, 
  selectedMealType, 
  onSelectRecipe, 
  onClose,
  onViewRecipeDetails,
  mealPlan
}: RecipeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sanityRecipes, setSanityRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get the display number for the selected meal
  const getMealDisplayNumber = () => {
    if (!mealPlan || !mealPlan[selectedDay]) return '';
    
    const mealIds = Object.keys(mealPlan[selectedDay]);
    const index = mealIds.indexOf(selectedMealType);
    
    if (index === -1) return '';
    return index + 1;
  };
  
  // Fetch recipes from Sanity
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await client.fetch(getAllRecipesQuery);
        
        // Transform Sanity data to match our Recipe type
        const transformedRecipes: Recipe[] = result.map((item: any) => ({
          id: item._id,
          _id: item._id,
          name: item.tittel,
          tittel: item.tittel,
          image: item.image,
          totalKcal: item.totalKcal,
          totalMakros: item.totalMakros
        }));
        
        setSanityRecipes(transformedRecipes);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Kunne ikke hente oppskrifter. Bruker eksempeldata i stedet.');
        // Fallback to sample recipes
        setSanityRecipes(initialRecipes);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, []);
  
  // Use Sanity recipes if available, otherwise use initial recipes
  const allRecipes = sanityRecipes.length > 0 ? sanityRecipes : initialRecipes;

  // Filter recipes based on search query
  const filteredRecipes = allRecipes.filter(recipe => {
    const recipeName = recipe.name || recipe.tittel || '';
    return recipeName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary.green} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons name="restaurant-outline" size={22} color={colors.primary.green} />
          <Text style={styles.title}>
            Måltid {getMealDisplayNumber()} - {selectedDay}
          </Text>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Søk etter oppskrifter..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.secondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.green} />
          <Text style={styles.loadingText}>Laster oppskrifter...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.recipeList}
          contentContainerStyle={styles.recipeListContent}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <View key={recipe.id} style={styles.recipeItemContainer}>
                <TouchableOpacity 
                  style={styles.recipeItem}
                  onPress={() => onSelectRecipe(recipe)}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: recipe.image }} 
                    style={styles.recipeImage} 
                  />
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName}>{recipe.name || recipe.tittel}</Text>
                    {recipe.totalKcal && (
                      <Text style={styles.recipeDetails}>{recipe.totalKcal} kcal</Text>
                    )}
                  </View>
                  <Ionicons name="add-circle" size={26} color={colors.primary.green} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => onViewRecipeDetails(recipe)}
                >
                  <Ionicons name="information-circle-outline" size={18} color={colors.primary.green} />
                  <Text style={styles.viewDetailsText}>Se detaljer</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={50} color={colors.text.secondary} />
              <Text style={styles.emptyStateText}>Ingen oppskrifter funnet</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: colors.background.DEFAULT,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary.black,
    fontFamily: fonts.heading.serif,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.DEFAULT,
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: fonts.body.regular,
    color: colors.text.DEFAULT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.body.medium,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontFamily: fonts.body.medium,
  },
  recipeList: {
    flex: 1,
  },
  recipeListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  recipeItemContainer: {
    backgroundColor: colors.background.DEFAULT,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recipeImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary.black,
    fontFamily: fonts.body.medium,
  },
  recipeDetails: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: fonts.body.regular,
    marginTop: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: 'rgba(74, 108, 98, 0.05)',
  },
  viewDetailsText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.primary.green,
    fontFamily: fonts.body.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: fonts.body.medium,
  },
});

export default RecipeSelector; 