import { client } from '@lib/sanity';
import { supabase } from '@lib/supabase';

export interface Subscription {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  features: string[];
  isDefault: boolean;
  recipeAccess: {
    accessType: 'limited' | 'full';
    maxRecipes?: number;
  };
  mealStorage: {
    storageDuration: string;
  };
  favoriteRecipes: {
    canFavorite: boolean;
    maxFavorites?: string;
  };
  expertMealPlanning: boolean;
}

/**
 * Fetches all available subscriptions from Sanity
 */
export async function getSubscriptions(): Promise<Subscription[]> {
  const query = `*[_type == "tier"] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    features,
    isDefault,
    recipeAccess,
    mealStorage,
    favoriteRecipes,
    expertMealPlanning
  }`;

  try {
    const subscriptions = await client.fetch<Subscription[]>(query);
    return subscriptions;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

/**
 * Fetches the default subscription from Sanity
 */
export async function getDefaultSubscription(): Promise<Subscription | null> {
  const query = `*[_type == "tier" && isDefault == true][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    features,
    isDefault,
    recipeAccess,
    mealStorage,
    favoriteRecipes,
    expertMealPlanning
  }`;

  try {
    const subscription = await client.fetch<Subscription | null>(query);
    return subscription;
  } catch (error) {
    console.error('Error fetching default subscription:', error);
    throw error;
  }
}

/**
 * Fetches a subscription by its slug from Sanity
 */
export async function getSubscriptionBySlug(slug: string): Promise<Subscription | null> {
  const query = `*[_type == "tier" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    features,
    isDefault,
    recipeAccess,
    mealStorage,
    favoriteRecipes,
    expertMealPlanning
  }`;

  try {
    const subscription = await client.fetch<Subscription | null>(query, { slug });
    return subscription;
  } catch (error) {
    console.error(`Error fetching subscription with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Sets a user's subscription in Supabase
 */
export async function setUserSubscription(userId: string, subscriptionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_id: subscriptionId })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error setting user subscription:', error);
    throw error;
  }
}

/**
 * Gets a user's current subscription from Supabase and Sanity
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    // Get the user's subscription ID from Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    if (!data?.subscription_id) {
      return null;
    }

    // Get the subscription details from Sanity
    const query = `*[_type == "tier" && _id == $subscriptionId][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      features,
      isDefault,
      recipeAccess,
      mealStorage,
      favoriteRecipes,
      expertMealPlanning
    }`;

    const subscription = await client.fetch<Subscription | null>(query, { 
      subscriptionId: data.subscription_id 
    });
    
    return subscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
} 