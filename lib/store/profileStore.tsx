import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { useAuthStore } from './authStore';

// Define types for our profile data
interface Profile {
  id: string;
  full_name: string;
  weight: string;
  height: string;
  age: string;
  updated_at: string;
}

interface DietaryRequirement {
  id: string;
  requirement_type: string;
}

interface Allergy {
  id: string;
  allergy_name: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

interface FoodPreference {
  id: string;
  preference_type: string;
  preference_value: string;
}

interface BudgetSetting {
  id: string;
  amount: number;
  period: 'weekly' | 'monthly';
}

interface PortionSetting {
  id: string;
  number_of_people: number;
}

// Define the context state
interface ProfileContextState {
  profile: Profile | null;
  dietaryRequirements: DietaryRequirement[];
  allergies: Allergy[];
  foodPreferences: FoodPreference[];
  budgetSettings: BudgetSetting | null;
  portionSettings: PortionSetting | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  refreshProfile: () => Promise<void>;
  isStale: () => boolean;
}

// Create the context
const ProfileContext = createContext<ProfileContextState | undefined>(undefined);

// Cache expiration time (in milliseconds) - 5 minutes
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Provider component
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dietaryRequirements, setDietaryRequirements] = useState<DietaryRequirement[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<FoodPreference[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSetting | null>(null);
  const [portionSettings, setPortionSettings] = useState<PortionSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Check if the cache is stale
  const isStale = () => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > CACHE_EXPIRATION;
  };

  // Fetch all profile data
  const fetchProfileData = async () => {
    if (!session?.user || isFetching) return;
    
    setIsFetching(true);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch dietary requirements
      const { data: dietaryData, error: dietaryError } = await supabase
        .from('dietary_requirements')
        .select('*')
        .eq('profile_id', session.user.id);

      if (dietaryError) throw dietaryError;
      setDietaryRequirements(dietaryData || []);

      // Fetch allergies
      const { data: allergiesData, error: allergiesError } = await supabase
        .from('allergies')
        .select('*')
        .eq('profile_id', session.user.id);

      if (allergiesError) throw allergiesError;
      setAllergies(allergiesData || []);

      // Fetch food preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('food_preferences')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('preference_type', 'cuisine_preference');

      if (preferencesError) throw preferencesError;
      setFoodPreferences(preferencesData || []);

      // Fetch budget settings
      const { data: budgetData, error: budgetError } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('profile_id', session.user.id)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') throw budgetError;
      setBudgetSettings(budgetData || null);

      // Fetch portion settings
      const { data: portionData, error: portionError } = await supabase
        .from('portion_settings')
        .select('*')
        .eq('profile_id', session.user.id)
        .single();

      if (portionError && portionError.code !== 'PGRST116') throw portionError;
      setPortionSettings(portionData || null);

      // Update last fetched timestamp
      setLastFetched(Date.now());
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Initial fetch when the user is authenticated
  useEffect(() => {
    if (session?.user && (isStale() || !profile)) {
      fetchProfileData();
    }
  }, [session]);

  // Refresh function to manually trigger a refresh
  const refreshProfile = async () => {
    await fetchProfileData();
  };

  // Context value
  const value: ProfileContextState = {
    profile,
    dietaryRequirements,
    allergies,
    foodPreferences,
    budgetSettings,
    portionSettings,
    loading,
    error,
    lastFetched,
    refreshProfile,
    isStale
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Hook to use the profile context
export const useProfileStore = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileStore must be used within a ProfileProvider');
  }
  return context;
}; 