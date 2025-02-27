import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { client, urlFor } from '@/lib/sanity';

// Types
export interface Recipe {
  _id: string;
  tittel: string;
  image: string;
  kategorier: Array<{
    _id: string;
    name: string;
  }>;
  totalKcal: number;
  totalMakros?: {
    protein: number;
    karbs: number;
    fett: number;
  };
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

interface ContentContextState {
  recipes: Recipe[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  refreshContent: () => Promise<void>;
  isCacheStale: () => boolean;
}

// Context
const ContentContext = createContext<ContentContextState | undefined>(undefined);

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

// Provider component
export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const query = `*[_type == "kategori"] {
        _id,
        name,
        description,
        image
      }`;
      const data = await client.fetch<Category[]>(query);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    }
  };

  const fetchRecipes = async () => {
    try {
      console.log('Fetching recipes from Sanity...');
      const query = `*[_type == "oppskrift"] {
        _id,
        tittel,
        image,
        "kategorier": kategori[]->{
          _id,
          name
        },
        totalKcal,
        totalMakros
      }`;
      console.log('Recipe query:', query);
      const data = await client.fetch<Recipe[]>(query);
      console.log(`Fetched ${data.length} recipes`);
      
      // Log the first recipe to check its structure
      if (data.length > 0) {
        console.log('First recipe:', JSON.stringify(data[0], null, 2));
        
        // Check if recipes have categories
        const recipesWithCategories = data.filter(recipe => 
          recipe.kategorier && Array.isArray(recipe.kategorier) && recipe.kategorier.length > 0
        );
        console.log(`Recipes with categories: ${recipesWithCategories.length} out of ${data.length}`);
      }
      
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to fetch recipes');
    }
  };

  const refreshContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchCategories(), fetchRecipes()]);
      setLastFetched(Date.now());
    } catch (error) {
      console.error('Error refreshing content:', error);
      setError('Failed to refresh content');
    } finally {
      setIsLoading(false);
    }
  };

  const isCacheStale = () => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > CACHE_EXPIRATION_TIME;
  };

  // Initial fetch
  useEffect(() => {
    refreshContent();
  }, []);

  const contextValue: ContentContextState = {
    recipes,
    categories,
    isLoading,
    error,
    lastFetched,
    refreshContent,
    isCacheStale,
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

// Hook to use the content context
export const useContentStore = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContentStore must be used within a ContentProvider');
  }
  return context;
}; 