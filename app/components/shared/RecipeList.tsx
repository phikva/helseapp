import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../../lib/theme';
import { getRecipeImageSource } from '../../../lib/imageUtils';

type RecipeListProps = {
  recipes: any[];
  isLoading: boolean;
  error: string | null;
  onRecipePress: (recipe: any) => void;
  onAddRecipe: (recipe: any) => void;
  mode?: 'select' | 'view';
};

const RecipeList = ({ 
  recipes, 
  isLoading, 
  error, 
  onRecipePress,
  onAddRecipe,
  mode = 'select'
}: RecipeListProps) => {
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

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.recipeCard}
          onPress={() => onRecipePress(item)}
          activeOpacity={0.7}
        >
          <Image 
            source={getRecipeImageSource(item.image, 200, 200, item._id)}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeName}>{item.tittel}</Text>
            
            <View style={styles.recipeDetails}>
              {item.totalKcal && (
                <View style={styles.detailItem}>
                  <Ionicons name="flame-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.detailText}>{Math.round(item.totalKcal)} kcal</Text>
                </View>
              )}
              
              {item.tilberedningstid && (
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.detailText}>{item.tilberedningstid}</Text>
                </View>
              )}
            </View>
          </View>
          
          {mode === 'select' ? (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onPress
                onAddRecipe(item);
              }}
            >
              <Ionicons name="add-circle" size={26} color={colors.primary.green} />
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButton}>
              <Ionicons name="chevron-forward" size={22} color={colors.text.secondary} />
            </View>
          )}
        </TouchableOpacity>
      )}
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
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.DEFAULT,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recipeName: {
    fontSize: 16,
    fontFamily: fonts.heading.serif,
    color: colors.text.DEFAULT,
    marginBottom: 4,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
    fontFamily: fonts.body.regular,
  },
  actionButton: {
    justifyContent: 'center',
    paddingRight: 12,
  },
});

export default RecipeList; 