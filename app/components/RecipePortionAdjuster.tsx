import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useProfileStore } from '../../lib/store/profileStore';

interface RecipePortionAdjusterProps {
  defaultPortions: number;
  onPortionsChange: (newPortions: number) => void;
}

export default function RecipePortionAdjuster({ 
  defaultPortions, 
  onPortionsChange 
}: RecipePortionAdjusterProps) {
  const { portionSettings } = useProfileStore();
  const [portions, setPortions] = useState<number>(defaultPortions);

  // Initialize with user's preferred portions if available
  useEffect(() => {
    if (portionSettings?.number_of_people) {
      setPortions(portionSettings.number_of_people);
      onPortionsChange(portionSettings.number_of_people);
    }
  }, [portionSettings]);

  const decreasePortions = () => {
    if (portions > 1) {
      const newPortions = portions - 1;
      setPortions(newPortions);
      onPortionsChange(newPortions);
    }
  };

  const increasePortions = () => {
    const newPortions = portions + 1;
    setPortions(newPortions);
    onPortionsChange(newPortions);
  };

  return (
    <View className="mb-6">
      <Text className="font-heading-serif text-display-small text-primary-black mb-2">
        Porsjoner
      </Text>
      
      <View className="flex-row items-center justify-between bg-background-secondary rounded-2xl p-4">
        <TouchableOpacity
          onPress={decreasePortions}
          disabled={portions <= 1}
          className={`w-10 h-10 rounded-full ${
            portions <= 1 ? 'bg-gray-200' : 'bg-primary-purple'
          } justify-center items-center`}
        >
          <Text style={{ color: portions <= 1 ? '#9CA3AF' : 'white', fontSize: 20, fontWeight: 'bold' }}>
            -
          </Text>
        </TouchableOpacity>
        
        <Text className="text-display-medium font-heading-medium text-primary-black">
          {portions}
        </Text>
        
        <TouchableOpacity
          onPress={increasePortions}
          className="w-10 h-10 rounded-full bg-primary-purple justify-center items-center"
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 