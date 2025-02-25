import { useEffect, useState } from 'react';
import { useAuthStore } from '@lib/store/authStore';
import { useSubscriptionStore } from '@lib/store/subscriptionStore';

interface SubscriptionFeatures {
  // Recipe access
  hasFullRecipeAccess: boolean;
  maxRecipes: number | null;
  
  // Meal storage
  mealStorageDuration: string;
  
  // Favorites
  canSaveFavorites: boolean;
  maxFavorites: number | null;
  
  // Expert meal planning
  hasExpertMealPlanning: boolean;
  
  // Loading state
  isLoading: boolean;
}

export function useSubscriptionFeatures(): SubscriptionFeatures {
  const { session } = useAuthStore();
  const { currentSubscription, fetchUserSubscription, isLoading } = useSubscriptionStore();
  const [features, setFeatures] = useState<SubscriptionFeatures>({
    hasFullRecipeAccess: false,
    maxRecipes: null,
    mealStorageDuration: '7',
    canSaveFavorites: false,
    maxFavorites: null,
    hasExpertMealPlanning: false,
    isLoading: true
  });

  useEffect(() => {
    if (session?.user && !currentSubscription && !isLoading) {
      fetchUserSubscription(session.user.id);
    }
  }, [session, currentSubscription, isLoading]);

  useEffect(() => {
    if (currentSubscription) {
      // Parse maxFavorites to a number if it's not "uendelig"
      let maxFavorites: number | null = null;
      if (currentSubscription.favoriteRecipes.maxFavorites && currentSubscription.favoriteRecipes.maxFavorites !== 'uendelig') {
        maxFavorites = parseInt(currentSubscription.favoriteRecipes.maxFavorites);
      }
      
      // Parse maxRecipes
      let maxRecipes: number | null = null;
      if (currentSubscription.recipeAccess.accessType === 'limited' && currentSubscription.recipeAccess.maxRecipes) {
        maxRecipes = currentSubscription.recipeAccess.maxRecipes;
      }
      
      setFeatures({
        hasFullRecipeAccess: currentSubscription.recipeAccess.accessType === 'full',
        maxRecipes,
        mealStorageDuration: currentSubscription.mealStorage.storageDuration,
        canSaveFavorites: currentSubscription.favoriteRecipes.canFavorite,
        maxFavorites,
        hasExpertMealPlanning: currentSubscription.expertMealPlanning,
        isLoading: false
      });
    } else {
      // Default features for users without a subscription
      setFeatures({
        hasFullRecipeAccess: false,
        maxRecipes: 10, // Default limit
        mealStorageDuration: '7',
        canSaveFavorites: true,
        maxFavorites: 5, // Default limit
        hasExpertMealPlanning: false,
        isLoading: isLoading
      });
    }
  }, [currentSubscription, isLoading]);

  return features;
} 