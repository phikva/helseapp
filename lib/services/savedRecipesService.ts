import { supabase } from '../supabase';
import { Recipe } from '../store/contentStore';

export interface SavedRecipe {
  id: string;
  profile_id: string;
  recipe_id: string;
  saved_at: string;
  notes: string | null;
  is_favorite: boolean;
  recipe?: Recipe; // Optional recipe details when joined with recipe data
}

// Save a recipe to the user's saved recipes
export async function saveRecipe(userId: string, recipeId: string, isFavorite: boolean = false, notes: string = '') {
  try {
    // Check if the user's session is valid
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (!sessionData.session) {
      throw new Error('No active session found. Please log in.');
    }
    
    // Ensure the user ID matches the authenticated user
    if (userId !== sessionData.session.user.id) {
      throw new Error('User ID mismatch. Please log in again.');
    }
    
    // Check if the recipe already exists for this user
    const { data: existingRecipe, error: checkError } = await supabase
      .from('saved_recipes')
      .select('id, is_favorite')
      .eq('profile_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing recipe:', checkError);
      throw checkError;
    }
    
    if (existingRecipe) {
      // Update existing record
      const { data, error } = await supabase
        .from('saved_recipes')
        .update({
          is_favorite: isFavorite,
          notes: notes || existingRecipe.notes,
          saved_at: new Date().toISOString()
        })
        .eq('id', existingRecipe.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('saved_recipes')
        .insert({
          profile_id: userId,
          recipe_id: recipeId,
          is_favorite: isFavorite,
          notes: notes || null,
          saved_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
}

// Get all saved recipes for a user
export async function getSavedRecipes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('profile_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    throw error;
  }
}

// Get favorite recipes for a user
export async function getFavoriteRecipes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('profile_id', userId)
      .eq('is_favorite', true)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    throw error;
  }
}

// Toggle favorite status for a saved recipe
export async function toggleFavorite(savedRecipeId: string) {
  try {
    // First get the current status
    const { data: currentData, error: fetchError } = await supabase
      .from('saved_recipes')
      .select('is_favorite')
      .eq('id', savedRecipeId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the status
    const { data, error } = await supabase
      .from('saved_recipes')
      .update({ is_favorite: !currentData.is_favorite })
      .eq('id', savedRecipeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
}

// Update notes for a saved recipe
export async function updateNotes(savedRecipeId: string, notes: string) {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .update({ notes })
      .eq('id', savedRecipeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating notes:', error);
    throw error;
  }
}

// Delete a saved recipe
export async function deleteSavedRecipe(savedRecipeId: string) {
  try {
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', savedRecipeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting saved recipe:', error);
    throw error;
  }
}

// Remove a recipe from saved recipes by recipe ID and user ID
export async function removeRecipe(userId: string, recipeId: string) {
  try {
    // Check if the user's session is valid
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (!sessionData.session) {
      throw new Error('No active session found. Please log in.');
    }
    
    // Ensure the user ID matches the authenticated user
    if (userId !== sessionData.session.user.id) {
      throw new Error('User ID mismatch. Please log in again.');
    }
    
    // Delete the recipe from saved_recipes
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('profile_id', userId)
      .eq('recipe_id', recipeId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing recipe:', error);
    throw error;
  }
} 