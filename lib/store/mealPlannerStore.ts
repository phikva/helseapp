import { create } from 'zustand';

type MealPlannerState = {
  // Navigation state
  previousScreen: string;
  currentWeek: Date;
  expandedDay: string;
  
  // Actions
  setPreviousScreen: (screen: string) => void;
  setCurrentWeek: (week: Date) => void;
  setExpandedDay: (day: string) => void;
  saveCurrentState: (screen: string, week: Date, day: string) => void;
};

export const useMealPlannerStore = create<MealPlannerState>((set) => ({
  // Initial state
  previousScreen: 'mealplanner',
  currentWeek: new Date(),
  expandedDay: 'Mandag',
  
  // Actions
  setPreviousScreen: (screen) => set({ previousScreen: screen }),
  setCurrentWeek: (week) => set({ currentWeek: week }),
  setExpandedDay: (day) => set({ expandedDay: day }),
  
  // Save all navigation state at once
  saveCurrentState: (screen, week, day) => set({
    previousScreen: screen,
    currentWeek: week,
    expandedDay: day
  }),
})); 