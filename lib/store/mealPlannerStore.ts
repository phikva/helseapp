import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, MealPlan, INITIAL_MEAL_PLAN } from '../../app/components/mealplanner/types';

// Helper function to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to get the start date of the week containing the given date
const getWeekStartDate = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  // Adjust to get Monday as the first day (0 = Sunday, 1 = Monday, etc.)
  const diff = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - diff);
  return result;
};

// Helper to format a week key from a date
const getWeekKey = (date: Date): string => {
  const weekStart = getWeekStartDate(date);
  return formatDateKey(weekStart);
};

type WeeklyMealPlans = {
  [weekKey: string]: MealPlan;
};

type MealPlannerState = {
  // Navigation state
  previousScreen: string;
  currentWeek: Date;
  expandedDay: string;
  
  // Meal plan data
  mealPlans: WeeklyMealPlans;
  
  // Actions - Navigation
  setPreviousScreen: (screen: string) => void;
  setCurrentWeek: (week: Date) => void;
  setExpandedDay: (day: string) => void;
  saveCurrentState: (screen: string, week: Date, day: string) => void;
  
  // Actions - Meal Plans
  getMealPlanForWeek: (weekDate: Date) => MealPlan;
  addMealToDay: (weekDate: Date, day: string, mealId: string, recipe: Recipe) => void;
  removeMealFromDay: (weekDate: Date, day: string, mealId: string) => void;
  addMealSlotToDay: (weekDate: Date, day: string, mealId: string) => void;
  clearMealPlanForWeek: (weekDate: Date) => void;
};

export const useMealPlannerStore = create<MealPlannerState>()(
  persist(
    (set, get) => ({
      // Initial navigation state
      previousScreen: 'mealplanner',
      currentWeek: new Date(),
      expandedDay: 'Mandag',
      
      // Initial meal plan data
      mealPlans: {},
      
      // Navigation actions
      setPreviousScreen: (screen) => set({ previousScreen: screen }),
      setCurrentWeek: (week) => set({ currentWeek: week }),
      setExpandedDay: (day) => set({ expandedDay: day }),
      
      // Save all navigation state at once
      saveCurrentState: (screen, week, day) => set({
        previousScreen: screen,
        currentWeek: week,
        expandedDay: day
      }),
      
      // Meal plan actions
      getMealPlanForWeek: (weekDate) => {
        const weekKey = getWeekKey(weekDate);
        const { mealPlans } = get();
        
        // Return existing meal plan or create a new one
        return mealPlans[weekKey] || { ...INITIAL_MEAL_PLAN };
      },
      
      addMealToDay: (weekDate, day, mealId, recipe) => {
        const weekKey = getWeekKey(weekDate);
        
        set((state) => {
          // Get current meal plan for the week or create a new one
          const currentWeekPlan = state.mealPlans[weekKey] || { ...INITIAL_MEAL_PLAN };
          
          // Create or update the day's meals
          const dayMeals = currentWeekPlan[day] || {};
          
          // Create updated state
          const updatedMealPlans = {
            ...state.mealPlans,
            [weekKey]: {
              ...currentWeekPlan,
              [day]: {
                ...dayMeals,
                [mealId]: recipe
              }
            }
          };
          
          // Return updated state
          return {
            mealPlans: updatedMealPlans
          };
        });
      },
      
      removeMealFromDay: (weekDate, day, mealId) => {
        const weekKey = getWeekKey(weekDate);
        
        set((state) => {
          // Get current meal plan for the week
          const currentWeekPlan = state.mealPlans[weekKey];
          if (!currentWeekPlan) return state; // No change if week doesn't exist
          
          // Get current day's meals
          const dayMeals = { ...currentWeekPlan[day] };
          if (!dayMeals) return state; // No change if day doesn't exist
          
          // Remove the meal
          delete dayMeals[mealId];
          
          // Create updated state
          const updatedMealPlans = {
            ...state.mealPlans,
            [weekKey]: {
              ...currentWeekPlan,
              [day]: dayMeals
            }
          };
          
          // Return updated state
          return {
            mealPlans: updatedMealPlans
          };
        });
      },
      
      addMealSlotToDay: (weekDate, day, mealId) => {
        const weekKey = getWeekKey(weekDate);
        
        set((state) => {
          // Get current meal plan for the week or create a new one
          const currentWeekPlan = state.mealPlans[weekKey] || { ...INITIAL_MEAL_PLAN };
          
          // Create or update the day's meals
          const dayMeals = currentWeekPlan[day] || {};
          
          // Create updated state
          const updatedMealPlans = {
            ...state.mealPlans,
            [weekKey]: {
              ...currentWeekPlan,
              [day]: {
                ...dayMeals,
                [mealId]: null
              }
            }
          };
          
          // Return updated state with new empty meal slot
          return {
            mealPlans: updatedMealPlans
          };
        });
      },
      
      clearMealPlanForWeek: (weekDate) => {
        const weekKey = getWeekKey(weekDate);
        
        set((state) => {
          // Create a new mealPlans object without the specified week
          const { [weekKey]: _, ...remainingMealPlans } = state.mealPlans;
          
          return {
            mealPlans: remainingMealPlans
          };
        });
      },
    }),
    {
      name: 'meal-planner-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mealPlans: state.mealPlans,
        currentWeek: state.currentWeek,
        expandedDay: state.expandedDay,
      }),
    }
  )
); 