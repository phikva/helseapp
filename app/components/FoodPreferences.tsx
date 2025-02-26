import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { client } from '../../lib/sanity';
import { kjokkenTyperQuery, type KjokkenType } from '../../lib/queries/brukerprofilQueries';
import FoodPreferencesSkeleton from './skeleton/FoodPreferencesSkeleton';
import { useProfileStore } from '../../lib/store/profileStore';

interface FoodPreference {
  id: string;
  preference_type: string;
  preference_value: string;
}

interface FoodPreferencesProps {
  profileId: string;
  onChanges: (values: Set<string>) => void;
  setInitialValues: (values: Set<string>) => void;
  cachedData?: boolean;
}

export default function FoodPreferences({ profileId, onChanges, setInitialValues, cachedData = false }: FoodPreferencesProps) {
  const [preferences, setPreferences] = useState<FoodPreference[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());
  const [kitchenTypes, setKitchenTypes] = useState<KjokkenType[]>([]);
  const [loading, setLoading] = useState(true);
  const { foodPreferences } = useProfileStore();

  useEffect(() => {
    fetchKitchenTypes();
    
    if (cachedData && foodPreferences.length > 0) {
      // Use cached data from the store
      setPreferences(foodPreferences);
      const initialValues = new Set(foodPreferences.map(pref => pref.preference_value) || []);
      setSelectedCuisines(initialValues);
      setInitialValues(initialValues);
      setLoading(false);
    } else {
      // Fetch from API if no cached data
      fetchPreferences();
    }
  }, []);

  const fetchKitchenTypes = async () => {
    try {
      const data = await client.fetch<KjokkenType[]>(kjokkenTyperQuery);
      setKitchenTypes(data || []);
    } catch (error) {
      console.error('Error fetching kitchen types:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('food_preferences')
        .select('*')
        .eq('profile_id', profileId)
        .eq('preference_type', 'cuisine_preference');

      if (error) throw error;
      setPreferences(data || []);
      const initialValues = new Set(data?.map(pref => pref.preference_value) || []);
      setSelectedCuisines(initialValues);
      setInitialValues(initialValues);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (cuisine: KjokkenType) => {
    setSelectedCuisines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cuisine.name)) {
        newSet.delete(cuisine.name);
      } else {
        newSet.add(cuisine.name);
      }
      onChanges(newSet);
      return newSet;
    });
  };

  if (loading) {
    return <FoodPreferencesSkeleton />;
  }

  return (
    <View className="mb-20">
      <Text className="font-heading-serif text-display-small text-primary-black mb-2">
        Matpreferanser
      </Text>
      <Text className="text-text-secondary text-body-large mb-6">
        Velg dine foretrukne kjøkkentyper
      </Text>
      
      <View className="flex-row flex-wrap gap-3">
        {kitchenTypes.map((cuisine) => {
          const isSelected = selectedCuisines.has(cuisine.name);
          return (
            <TouchableOpacity
              key={cuisine._id}
              onPress={() => toggleSelection(cuisine)}
              className={`px-4 py-2 rounded-full ${
                isSelected ? 'bg-primary-purple' : 'bg-gray-200'
              }`}
            >
              <Text className={`
                text-body-large font-heading-medium
                ${isSelected ? 'text-white' : 'text-gray-700'}
              `}>
                {cuisine.name}
              </Text>
              {cuisine.description && (
                <Text className={`
                  text-body-small mt-1
                  ${isSelected ? 'text-white/70' : 'text-gray-500'}
                `}>
                  {cuisine.description}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
} 