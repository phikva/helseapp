import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, fonts } from '../../../lib/theme';
import { MealType, Recipe, GENERIC_MEAL_TYPES } from './types';

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

  return (
    <View style={styles.dayContent}>
      <View style={styles.mealsContainer}>
        {activeMealSlots.map((mealId, index) => {
          // Use sequential numbering for display (1-based index)
          const displayNumber = index + 1;
          const displayName = `Måltid ${displayNumber}`;
          
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
                  style={styles.plannedMeal}
                  onPress={() => meals[mealId] && onViewRecipeDetails(meals[mealId])}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: meals[mealId]?.image }} 
                    style={styles.mealImage} 
                  />
                  <View style={styles.mealNameContainer}>
                    <Text style={styles.mealName}>
                      {meals[mealId]?.name || meals[mealId]?.tittel}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                  </View>
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
    backgroundColor: colors.background.DEFAULT,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  mealImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  mealNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealName: {
    flex: 1,
    fontSize: 14,
    color: colors.primary.black,
    fontFamily: fonts.body.regular,
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