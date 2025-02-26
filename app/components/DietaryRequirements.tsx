import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { client } from '../../lib/sanity';
import { kostholdsbehovQuery } from '../../lib/queries/brukerprofilQueries';
import DietaryRequirementsSkeleton from './skeleton/DietaryRequirementsSkeleton';
import { useProfileStore } from '../../lib/store/profileStore';

interface DietaryRequirement {
  id: string;
  requirement_type: string;
}

interface KostholdsbehovItem {
  navn: string;
  verdi: string;
  beskrivelse?: string;
}

interface DietaryRequirementsProps {
  profileId: string;
  onChanges: (values: Set<string>) => void;
  setInitialValues: (values: Set<string>) => void;
  cachedData?: boolean;
}

// Map Sanity values to Supabase enum values
const mapToSupabaseEnum = (sanityValue: string): string => {
  const mapping: { [key: string]: string } = {
    'vegansk': 'vegan',
    'vegetarsk': 'vegetarian',
    'lavkarbo': 'low_carb',
    'glutenfri': 'gluten_free',
    'laktosefri': 'lactose_free',
    'lavfett': 'low_fat'
  };
  return mapping[sanityValue] || sanityValue;
};

export default function DietaryRequirements({ profileId, onChanges, setInitialValues, cachedData = false }: DietaryRequirementsProps) {
  const [requirements, setRequirements] = useState<DietaryRequirement[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [kostholdsbehovOptions, setKostholdsbehovOptions] = useState<KostholdsbehovItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { dietaryRequirements } = useProfileStore();

  useEffect(() => {
    fetchKostholdsbehovOptions();
    
    if (cachedData && dietaryRequirements.length > 0) {
      // Use cached data from the store
      setRequirements(dietaryRequirements);
      const initialValues = new Set(dietaryRequirements.map(req => req.requirement_type) || []);
      setSelectedTypes(initialValues);
      setInitialValues(initialValues);
    } else {
      // Fetch from API if no cached data
      fetchDietaryRequirements();
    }
  }, []);

  const fetchKostholdsbehovOptions = async () => {
    try {
      const data = await client.fetch<KostholdsbehovItem[]>(kostholdsbehovQuery);
      setKostholdsbehovOptions(data || []);
    } catch (error) {
      console.error('Error fetching kostholdsbehov options:', error);
    }
  };

  const fetchDietaryRequirements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dietary_requirements')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      setRequirements(data || []);
      const initialValues = new Set(data?.map(req => req.requirement_type) || []);
      setSelectedTypes(initialValues);
      setInitialValues(initialValues);
    } catch (error) {
      console.error('Error fetching dietary requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (type: string) => {
    const supabaseType = mapToSupabaseEnum(type);
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(supabaseType)) {
        newSet.delete(supabaseType);
      } else {
        newSet.add(supabaseType);
      }
      onChanges(newSet);
      return newSet;
    });
  };

  if (loading || !kostholdsbehovOptions.length) {
    return <DietaryRequirementsSkeleton />;
  }

  return (
    <View className="mb-20">
      <Text className="font-heading-serif text-display-small text-primary-black mb-2">Kostholdsbehov</Text>
      <Text className="text-text-secondary text-body-large mb-6">
        Velg dine kostholdsbehov
      </Text>
      
      <View className="flex-row flex-wrap gap-3">
        {kostholdsbehovOptions.map((option) => {
          const supabaseType = mapToSupabaseEnum(option.verdi);
          const isSelected = selectedTypes.has(supabaseType);
          return (
            <TouchableOpacity
              key={option.verdi}
              onPress={() => toggleSelection(option.verdi)}
              className={`px-4 py-2 rounded-full ${
                isSelected ? 'bg-primary-purple' : 'bg-gray-200'
              }`}
            >
              <Text className={`
                text-body-large font-heading-medium
                ${isSelected ? 'text-white' : 'text-gray-700'}
              `}>
                {option.navn}
              </Text>
              {option.beskrivelse && (
                <Text className={`
                  text-body-small mt-1
                  ${isSelected ? 'text-white/70' : 'text-gray-500'}
                `}>
                  {option.beskrivelse}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
} 