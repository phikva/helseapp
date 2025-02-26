import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { buttonStyles } from '../../lib/theme';
import PortionSettingsSkeleton from './skeleton/PortionSettingsSkeleton';
import { useProfileStore } from '../../lib/store/profileStore';

interface PortionSetting {
  id: string;
  number_of_people: number;
}

interface PortionSettingsProps {
  profileId: string;
  onChanges?: (value: number) => void;
  setInitialValues?: (value: number) => void;
  cachedData?: boolean;
}

export default function PortionSettings({ profileId, onChanges, setInitialValues, cachedData = false }: PortionSettingsProps) {
  const [portions, setPortions] = useState<PortionSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialValue, setInitialValue] = useState<number | null>(null);
  const { portionSettings } = useProfileStore();

  useEffect(() => {
    if (cachedData && portionSettings) {
      // Use cached data from the store
      setPortions(portionSettings);
      setInitialValue(portionSettings.number_of_people);
      if (setInitialValues) {
        setInitialValues(portionSettings.number_of_people);
      }
      setLoading(false);
    } else {
      // Fetch from API if no cached data
      fetchPortions();
    }
  }, []);

  const fetchPortions = async () => {
    try {
      const { data, error } = await supabase
        .from('portion_settings')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setPortions(data);
        setInitialValue(data.number_of_people);
        if (setInitialValues) {
          setInitialValues(data.number_of_people);
        }
      }
    } catch (error) {
      console.error('Error fetching portions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePortions = async (numberOfPeople: number) => {
    try {
      const portionData = {
        profile_id: profileId,
        number_of_people: numberOfPeople
      };

      if (portions?.id) {
        const { error } = await supabase
          .from('portion_settings')
          .update(portionData)
          .eq('id', portions.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('portion_settings')
          .insert([portionData]);
        if (error) throw error;
      }

      setPortions({...portions, number_of_people: numberOfPeople} as PortionSetting);
      
      if (onChanges) {
        onChanges(numberOfPeople);
      }
    } catch (error) {
      console.error('Error updating portions:', error);
    }
  };

  if (loading) {
    return <PortionSettingsSkeleton />;
  }

  return (
    <View className="mb-20">
      <Text className="font-heading-serif text-display-small text-primary-black mb-2">Antall porsjoner</Text>
      <Text className="text-text-secondary text-body-large mb-6">
        Hvor mange personer lager du vanligvis mat til?
      </Text>
      
      <View className="bg-background-secondary rounded-2xl p-4">
        <View className="flex-row flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <TouchableOpacity
              key={number}
              onPress={() => updatePortions(number)}
              className={`w-14 h-14 rounded-full ${
                portions?.number_of_people === number 
                  ? 'bg-primary-purple'
                  : 'bg-gray-200'
              } justify-center items-center`}
            >
              <Text className={`
                text-body-large font-heading-medium
                ${portions?.number_of_people === number ? 'text-white' : 'text-gray-700'}
              `}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
} 