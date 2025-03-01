import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, fonts } from '../../../lib/theme';
import { MealType, Recipe, GENERIC_MEAL_TYPES } from './types';
import { useContentStore } from '../../../lib/store/contentStore';
import { getRecipeImageSource } from '../../../lib/imageUtils';

type DayMealPlanProps = {
  day: string;
  meals: {
    [key: string]: Recipe | null;
  };
  onAddMeal: (day: string, mealType: string) => void;
  onRemoveMeal: (day: string, mealType: string) => void;
  onAddNewMealSlot: (day: string) => void;
  onViewRecipeDetails: (recipe: Recipe) => void;
};

const DayMealPlan = ({ 
  day, 
  meals, 
  onAddMeal, 
  onRemoveMeal,
  onAddNewMealSlot,
  onViewRecipeDetails
}: DayMealPlanProps) => {
  const { getRecipeColor } = useContentStore();
  
  // Keep track of the last used color to avoid repeating colors
  const lastUsedColorRef = useRef<string | null>(null);
  
  // Available colors for recipes (excluding 'light')
  const availableColors = ['green', 'cyan', 'purple', 'pink', 'blue'];
  
  // Get active meal slots for this day
  const activeMealSlots = Object.keys(meals);
  
  // Find the next available meal slot number
  const getNextMealNumber = () => {
    const existingNumbers = activeMealSlots.map(slot => {
      const match = slot.match(/meal(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    if (existingNumbers.length === 0) return 1;
    return Math.max(...existingNumbers) + 1;
  };
  
  // Function to get a color that's different from the last used one
  const getUniqueColor = (recipeId: string): string => {
    if (!recipeId) return availableColors[0];
    
    // Get the base color from the recipe ID
    let baseColor = getRecipeColor(recipeId);
    
    // If the color is 'light', replace it with a different color
    if (baseColor === 'light') {
      // Find a color that's not 'light' and not the last used color
      const otherColors = availableColors.filter(c => c !== 'light' && c !== lastUsedColorRef.current);
      // Use a deterministic approach to select a replacement color
      const hash = recipeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      baseColor = otherColors[hash % otherColors.length];
    }
    
    // If this color is the same as the last used color, pick a different one
    if (baseColor === lastUsedColorRef.current && availableColors.length > 1) {
      // Find colors that are not the last used color
      const otherColors = availableColors.filter(c => c !== lastUsedColorRef.current);
      // Use a deterministic approach to select a replacement color
      const hash = recipeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      baseColor = otherColors[hash % otherColors.length];
    }
    
    // Update the last used color
    lastUsedColorRef.current = baseColor;
    
    return baseColor;
  };

  return (
    <View style={styles.dayContent}>
      <View style={styles.mealsContainer}>
        {activeMealSlots.map((mealId, index) => {
          // Use sequential numbering for display (1-based index)
          const displayNumber = index + 1;
          const displayName = `Måltid ${displayNumber}`;
          
          // Get recipe and color if available
          const recipe = meals[mealId];
          const recipeId = recipe ? (recipe._id || recipe.id || '') : '';
          const colorName = recipe ? getUniqueColor(recipeId) : '';
          const bgColor = recipe ? colors.primary[colorName as keyof typeof colors.primary] : '';
          
          return (
            <View key={mealId} style={styles.mealSlot}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTypeContainer}>
                  <Ionicons name="restaurant-outline" size={18} color={colors.primary.green} />
                  <Text style={styles.mealTypeText}>{displayName}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.removeMealButton}
                  onPress={() => onRemoveMeal(day, mealId)}
                >
                  <Ionicons 
                    name={meals[mealId] ? "close-circle" : "trash-outline"} 
                    size={20} 
                    color={colors.primary.green} 
                  />
                </TouchableOpacity>
              </View>
              
              {meals[mealId] ? (
                // Meal is planned - make it clickable to view details
                <TouchableOpacity 
                  style={[styles.plannedMeal, { backgroundColor: bgColor }]}
                  onPress={() => meals[mealId] && onViewRecipeDetails(meals[mealId])}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={getRecipeImageSource(recipe?.image, 100, 100, recipeId)} 
                    style={styles.mealImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.mealInfoContainer}>
                    <Text style={styles.mealName}>
                      {recipe?.name || recipe?.tittel}
                    </Text>
                    
                    {recipe?.totalKcal && (
                      <View style={styles.nutritionInfo}>
                        <Text style={styles.nutritionText}>
                          {Math.round(recipe.totalKcal)} kcal
                        </Text>
                        {recipe.totalMakros?.protein && (
                          <Text style={styles.nutritionText}>
                            {Math.round(recipe.totalMakros.protein)}g protein
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                // No meal planned yet
                <TouchableOpacity 
                  style={styles.addMealButton}
                  onPress={() => onAddMeal(day, mealId)}
                >
                  <Ionicons name="add" size={24} color={colors.primary.green} />
                  <Text style={styles.addMealText}>Legg til måltid</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        
        {/* Add new meal slot button */}
        {activeMealSlots.length < 6 && (
          <TouchableOpacity 
            style={styles.addNewMealButton}
            onPress={() => onAddNewMealSlot(day)}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.primary.green} />
            <Text style={styles.addNewMealText}>Legg til nytt måltid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dayContent: {
    padding: 16,
    paddingTop: 8,
  },
  mealsContainer: {
    gap: 12,
  },
  mealSlot: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealTypeText: {
    fontSize: 15,
    color: colors.primary.green,
    fontWeight: '500',
    fontFamily: fonts.body.medium,
  },
  plannedMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    overflow: 'hidden',
  },
  mealImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  mealInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: fonts.heading.serif,
    marginBottom: 2,
  },
  nutritionInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  nutritionText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  removeMealButton: {
    padding: 4,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(74, 108, 98, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary.green,
  },
  addMealText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary.green,
    fontFamily: fonts.body.medium,
  },
  addNewMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(74, 108, 98, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(74, 108, 98, 0.3)',
    marginTop: 4,
  },
  addNewMealText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary.green,
    fontFamily: fonts.body.medium,
  },
});

export default DayMealPlan; 