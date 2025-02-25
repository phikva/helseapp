import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { client } from '../../lib/sanity';
import { allergierQuery, type AllergiItem } from '../../lib/queries/brukerprofilQueries';

interface Allergy {
  id: string;
  allergy_name: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

interface AllergiesProps {
  profileId: string;
  onChanges: (values: Set<string>) => void;
  setInitialValues: (values: Set<string>) => void;
}

export default function Allergies({ profileId, onChanges, setInitialValues }: AllergiesProps) {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<Set<string>>(new Set());
  const [commonAllergies, setCommonAllergies] = useState<AllergiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllergies();
    fetchCommonAllergies();
  }, []);

  const fetchCommonAllergies = async () => {
    try {
      const data = await client.fetch<AllergiItem[]>(allergierQuery);
      setCommonAllergies(data || []);
    } catch (error) {
      console.error('Error fetching common allergies:', error);
    }
  };

  const fetchAllergies = async () => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      setAllergies(data || []);
      const initialValues = new Set(data?.map(allergy => allergy.allergy_name) || []);
      setSelectedAllergies(initialValues);
      setInitialValues(initialValues);
    } catch (error) {
      console.error('Error fetching allergies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (allergyName: string) => {
    setSelectedAllergies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(allergyName)) {
        newSet.delete(allergyName);
      } else {
        newSet.add(allergyName);
      }
      onChanges(newSet);
      return newSet;
    });
  };

  if (loading) {
    return (
      <View className="mb-6">
        <Text className="text-text-secondary text-body-medium mb-3">Laster allergier...</Text>
      </View>
    );
  }

  return (
    <View className="mb-20">
      <Text className="font-heading-serif text-display-small text-primary-Black mb-2">Allergier</Text>
      <Text className="text-text-secondary text-body-large mb-6">Velg dine allergier</Text>
      
      <View className="flex-row flex-wrap gap-2">
        {commonAllergies.map((allergy) => {
          const isSelected = selectedAllergies.has(allergy.navn);
          return (
            <TouchableOpacity
              key={allergy.navn}
              onPress={() => toggleSelection(allergy.navn)}
              className={`px-4 py-2 rounded-full ${
                isSelected ? 'bg-primary-Green' : 'bg-gray-200'
              }`}
            >
              <Text className={`${
                isSelected ? 'text-white' : 'text-gray-700'
              } text-body-large`}>
                {allergy.navn}
              </Text>
              {allergy.beskrivelse && (
                <Text className={`${
                  isSelected ? 'text-white/70' : 'text-gray-500'
                } text-body-small`}>
                  {allergy.beskrivelse}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
} 