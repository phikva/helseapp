import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSavedRecipes, getFavoriteRecipes, SavedRecipe } from '../services/savedRecipesService';
import { useAuthStore } from './authStore';
import { client } from '../sanity';
import { Recipe } from './contentStore';
import { getRecipeByIdQuery } from '../queries/recipeQueries';

// Time in milliseconds before we consider the data stale (5 minutes)
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

// Add a cache for recipe details to avoid redundant fetches
const recipeDetailsCache: Record<string, Recipe> = {};

interface SavedRecipesContextType {
  savedRecipes: SavedRecipe[];
  favoriteRecipes: SavedRecipe[];
  isLoading: boolean;
  error: string | null;
  lastRefreshed: number | null;
  refreshSavedRecipes: () => Promise<void>;
  refreshFavoriteRecipes: () => Promise<void>;
  isCacheStale: () => boolean;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined);

// Create a ref to store the current context value for getState
let savedRecipesStore: SavedRecipesContextType | undefined;

export const useSavedRecipesStore = () => {
  const context = useContext(SavedRecipesContext);
  if (!context) {
    throw new Error('useSavedRecipesStore must be used within a SavedRecipesProvider');
  }
  return context;
};

// Add a getState method to access the store outside of React components
useSavedRecipesStore.getState = () => {
  if (!savedRecipesStore) {
    throw new Error('SavedRecipesStore not initialized yet');
  }
  return savedRecipesStore;
};

export const SavedRecipesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const { session } = useAuthStore();

  // Fetch recipe details from Sanity
  const fetchRecipeDetails = async (recipeId: string): Promise<Recipe | null> => {
    // Check cache first
    if (recipeDetailsCache[recipeId]) {
      return recipeDetailsCache[recipeId];
    }
    
    try {
      const recipe = await client.fetch(getRecipeByIdQuery, { id: recipeId });
      
      // Cache the result
      if (recipe) {
        recipeDetailsCache[recipeId] = recipe;
      }
      
      return recipe;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  };

  // Enrich saved recipes with recipe details
  const enrichSavedRecipes = async (savedRecipes: SavedRecipe[]): Promise<SavedRecipe[]> => {
    // Use Promise.all for parallel fetching
    const enrichedRecipes = await Promise.all(
      savedRecipes.map(async (savedRecipe) => {
        const recipeDetails = await fetchRecipeDetails(savedRecipe.recipe_id);
        return {
          ...savedRecipe,
          recipe: recipeDetails || undefined
        };
      })
    );
    return enrichedRecipes;
  };

  // Fetch all saved recipes
  const refreshSavedRecipes = async () => {
    if (!session?.user) return;
    
    // Don't set loading state if we already have data
    const shouldSetLoading = savedRecipes.length === 0;
    if (shouldSetLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const savedRecipesData = await getSavedRecipes(session.user.id);
      const enrichedRecipes = await enrichSavedRecipes(savedRecipesData);
      setSavedRecipes(enrichedRecipes);
      setLastRefreshed(Date.now());
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      setError('Failed to load saved recipes');
    } finally {
      if (shouldSetLoading) {
        setIsLoading(false);
      }
    }
  };

  // Fetch favorite recipes
  const refreshFavoriteRecipes = async () => {
    if (!session?.user) {
      console.log("No user session, skipping favorite recipes refresh");
      setIsLoading(false);
      return;
    }
    
    // Don't set loading state if we already have data
    const shouldSetLoading = favoriteRecipes.length === 0;
    if (shouldSetLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      console.log("Fetching favorite recipes for user:", session.user.id);
      const favoriteRecipesData = await getFavoriteRecipes(session.user.id);
      
      console.log("Favorite recipes data received:", favoriteRecipesData.length);
      
      // If we have no favorites, set an empty array and return early
      if (!favoriteRecipesData || favoriteRecipesData.length === 0) {
        console.log("No favorite recipes found for user");
        setFavoriteRecipes([]);
        setLastRefreshed(Date.now());
        if (shouldSetLoading) {
          setIsLoading(false);
        }
        return;
      }
      
      // Process the favorites we found
      console.log("Enriching favorite recipes with details");
      const enrichedRecipes = await enrichSavedRecipes(favoriteRecipesData);
      console.log("Enriched recipes:", enrichedRecipes.length);
      setFavoriteRecipes(enrichedRecipes);
      setLastRefreshed(Date.now());
    } catch (error) {
      console.error('Error fetching favorite recipes:', error);
      setError('Failed to load favorite recipes');
      // Make sure we still set favorites to empty array on error
      setFavoriteRecipes([]);
    } finally {
      // Always ensure loading state is reset
      if (shouldSetLoading) {
        setIsLoading(false);
      }
    }
  };

  // Initial load when user session changes
  useEffect(() => {
    if (session?.user) {
      refreshSavedRecipes();
      refreshFavoriteRecipes();
    } else {
      setSavedRecipes([]);
      setFavoriteRecipes([]);
      setIsLoading(false);
    }
  }, [session]);

  const isCacheStale = () => {
    if (lastRefreshed === null) return true;
    return Date.now() - lastRefreshed > CACHE_EXPIRY_TIME;
  };

  const contextValue = {
    savedRecipes,
    favoriteRecipes,
    isLoading,
    error,
    lastRefreshed,
    refreshSavedRecipes,
    refreshFavoriteRecipes,
    isCacheStale
  };
  
  // Update the savedRecipesStore ref whenever the context value changes
  savedRecipesStore = contextValue;

  return (
    <SavedRecipesContext.Provider value={contextValue}>
      {children}
    </SavedRecipesContext.Provider>
  );
}; 