import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../../../lib/theme';
import { INITIAL_MEAL_PLAN, SAMPLE_RECIPES, MealPlan, Recipe } from '../../components/mealplanner/types';
import DayMealPlan from '../../components/mealplanner/DayMealPlan';
import RecipeSelector from '../../components/shared/RecipeSelector';
import WeekSelector from '../../components/mealplanner/WeekSelector';
import Header from '../../components/ui/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMealPlannerStore } from '../../../lib/store/mealPlannerStore';
import RecipeDrawer from '../../components/RecipeDrawer';
import { useContentStore } from '../../../lib/store/contentStore';

export default function MealPlannerScreen() {
  const router = useRouter();
  const { getRecipeColor } = useContentStore();
  
  // Get state from Zustand store
  const { currentWeek: storedWeek, expandedDay: storedExpandedDay, setCurrentWeek, setExpandedDay, saveCurrentState } = useMealPlannerStore();
  
  // Local state
  const [currentWeek, setLocalCurrentWeek] = useState<Date>(storedWeek);
  const [selectedDay, setSelectedDay] = useState<string>(storedExpandedDay);
  const [selectedMealType, setSelectedMealType] = useState('meal1');
  const [mealPlan, setMealPlan] = useState<MealPlan>(INITIAL_MEAL_PLAN);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [expandedDays, setExpandedDays] = useState<{[key: string]: boolean}>({
    'Mandag': false,
    'Tirsdag': false,
    'Onsdag': false,
    'Torsdag': false,
    'Fredag': false,
    'Lørdag': false,
    'Søndag': false,
  });
  
  // Recipe drawer state
  const [selectedRecipe, setSelectedRecipe] = useState<{ id: string, color: string } | null>(null);
  
  // View mode state for recipe selector
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Initialize expanded days from stored state
  useEffect(() => {
    setExpandedDays(prev => ({
      ...prev,
      [storedExpandedDay]: true
    }));
  }, [storedExpandedDay]);
  
  // Sync local state with Zustand store
  useEffect(() => {
    setLocalCurrentWeek(storedWeek);
  }, [storedWeek]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setLocalCurrentWeek(newDate);
    setCurrentWeek(newDate);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setLocalCurrentWeek(newDate);
    setCurrentWeek(newDate);
  };

  // Handle selecting a meal for a specific day and meal type
  const selectMeal = (recipe: Recipe) => {
    setMealPlan(prevPlan => ({
      ...prevPlan,
      [selectedDay]: {
        ...prevPlan[selectedDay],
        [selectedMealType]: recipe,
      }
    }));
    setShowRecipeSelector(false);
  };

  // Handle removing a meal from the plan
  const removeMeal = (day: string, mealType: string) => {
    // Always remove the meal slot entirely
    const updatedDayMeals = { ...mealPlan[day] };
    delete updatedDayMeals[mealType];
    
    setMealPlan(prevPlan => ({
      ...prevPlan,
      [day]: updatedDayMeals
    }));
  };

  // Open recipe selector for a specific day and meal type
  const openRecipeSelector = (day: string, mealType: string) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setShowRecipeSelector(true);
  };

  // Toggle expanded state for a day
  const toggleDayExpansion = (day: string) => {
    // Update local state
    setExpandedDays(prev => {
      const newState = {
        ...prev,
        [day]: !prev[day]
      };
      
      // If expanding this day, update the Zustand store
      if (newState[day]) {
        setExpandedDay(day);
      }
      
      return newState;
    });
  };

  // Add a new meal slot to a day
  const addNewMealSlot = (day: string) => {
    const dayMeals = mealPlan[day];
    const mealNumbers = Object.keys(dayMeals)
      .map(key => {
        const match = key.match(/meal(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const nextMealNumber = mealNumbers.length > 0 ? Math.max(...mealNumbers) + 1 : 1;
    const newMealId = `meal${nextMealNumber}`;
    
    // Update meal plan with new slot
    setMealPlan(prevPlan => ({
      ...prevPlan,
      [day]: {
        ...prevPlan[day],
        [newMealId]: null
      }
    }));
    
    // Automatically open recipe selector for the new meal slot
    setSelectedDay(day);
    setSelectedMealType(newMealId);
    setShowRecipeSelector(true);
  };

  // View recipe details using the drawer
  const viewRecipeDetails = (recipe: Recipe) => {
    // Get the recipe ID, ensuring it's not undefined
    const recipeId = recipe._id || recipe.id || '';
    if (!recipeId) {
      console.error('Recipe ID is missing');
      return;
    }
    
    // Get color for the recipe
    const colorName = getRecipeColor(recipeId.toString());
    
    // Open the recipe drawer
    setSelectedRecipe({ id: recipeId.toString(), color: colorName });
    
    // Save current state for when returning from drawer
    saveCurrentState('mealplanner', currentWeek, selectedDay);
  };

  // Count meals for a day
  const countMealsForDay = (day: string) => {
    return Object.values(mealPlan[day]).filter(meal => meal !== null).length;
  };

  // Count total meal slots for a day
  const countTotalMealSlotsForDay = (day: string) => {
    return Object.keys(mealPlan[day]).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header with icon */}
      <Header 
        title="Måltidsplanlegger" 
        iconName="restaurant-outline" 
        iconSize={26}
      />
      
      {/* Week Selector */}
      <WeekSelector 
        currentWeek={currentWeek}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
      />

      {!showRecipeSelector ? (
        // Weekly Meal Plan View with ScrollView
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.keys(mealPlan).map((day) => (
            <View key={day} style={styles.daySection}>
              <TouchableOpacity 
                style={styles.daySectionHeader}
                onPress={() => toggleDayExpansion(day)}
                activeOpacity={0.7}
              >
                <View style={styles.dayHeaderLeft}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  <View style={styles.mealCountBadge}>
                    <Text style={styles.mealCountText}>
                      {countMealsForDay(day)}/{countTotalMealSlotsForDay(day)}
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name={expandedDays[day] ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color={colors.primary.green} 
                />
              </TouchableOpacity>
              
              {expandedDays[day] && (
                <DayMealPlan
                  day={day}
                  meals={mealPlan[day]}
                  onAddMeal={openRecipeSelector}
                  onRemoveMeal={removeMeal}
                  onAddNewMealSlot={addNewMealSlot}
                  onViewRecipeDetails={viewRecipeDetails}
                />
              )}
            </View>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      ) : (
        // Use our new shared RecipeSelector component
        <RecipeSelector
          onSelectRecipe={selectMeal}
          onClose={() => setShowRecipeSelector(false)}
          title={`Måltid - ${selectedDay}`}
          mode="select"
          initialViewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      
      {/* Recipe Drawer */}
      {selectedRecipe && (
        <RecipeDrawer
          recipeId={selectedRecipe.id}
          colorName={selectedRecipe.color}
          visible={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  daySection: {
    marginBottom: 12,
    backgroundColor: colors.background.DEFAULT,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.black,
    fontFamily: fonts.heading.serif,
    marginRight: 10,
  },
  mealCountBadge: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mealCountText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.body.medium,
  },
  bottomPadding: {
    height: 30,
  },
}); 