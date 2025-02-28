// Define the meal type structure
export type MealType = {
  id: string;
  name: string;
  icon: string;
};

// Define the recipe structure from Sanity
export type Recipe = {
  id: number | string;
  name: string;
  image: string;
  _id?: string;
  tittel?: string;
  totalKcal?: number;
  totalMakros?: {
    protein: number;
    karbs: number;
    fett: number;
  };
};

// Define the meal plan structure
export type MealPlan = {
  [day: string]: {
    [mealId: string]: Recipe | null;
  };
};

// Generic meal types
export const GENERIC_MEAL_TYPES: MealType[] = [
  { id: 'meal1', name: 'Måltid 1', icon: 'restaurant-outline' },
  { id: 'meal2', name: 'Måltid 2', icon: 'restaurant-outline' },
  { id: 'meal3', name: 'Måltid 3', icon: 'restaurant-outline' },
  { id: 'meal4', name: 'Måltid 4', icon: 'restaurant-outline' },
];

// Sample data for the meal plan with generic meal types
export const INITIAL_MEAL_PLAN: MealPlan = {
  'Mandag': {
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  },
  'Tirsdag': {
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  },
  'Onsdag': {
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  },
  'Torsdag': {
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  },
  'Fredag': {
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  },
  'Lørdag': {
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  },
  'Søndag': {
    meal1: null,
    meal2: null,
    meal3: null,
    meal4: null,
  },
};

// Sample recipes for demonstration (will be replaced with Sanity data)
export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 1,
    name: 'Havregrøt med bær',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 2,
    name: 'Kyllingsalat',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 3,
    name: 'Laks med grønnsaker',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 4,
    name: 'Yoghurt med nøtter',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 5,
    name: 'Omelett med spinat',
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 6,
    name: 'Pasta med kylling',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 7,
    name: 'Biff med poteter',
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 8,
    name: 'Frukt og nøtter',
    image: 'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
]; 