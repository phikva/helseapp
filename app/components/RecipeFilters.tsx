import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Animated, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { colors } from '../../lib/theme';
import { useContentStore } from '../../lib/store/contentStore';

interface Category {
  _id: string;
  name: string;
  image: string | null;
}

interface NutritionRange {
  min: number;
  max: number;
}

interface FilterValues {
  searchTerm: string;
  selectedCategories: string[];
  calories: NutritionRange;
  protein: NutritionRange;
  carbs: NutritionRange;
  fat: NutritionRange;
}

interface RecipeFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  maxValues: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.8;

export default function RecipeFilters({ onFilterChange, maxValues }: RecipeFiltersProps) {
  const [drawerAnim] = useState(new Animated.Value(DRAWER_HEIGHT));
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const { categories } = useContentStore();
  const [loading, setLoading] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [caloriesValue, setCaloriesValue] = useState<number>(0);
  const [proteinValue, setProteinValue] = useState<number>(0);
  const [carbsValue, setCarbsValue] = useState<number>(0);
  const [fatValue, setFatValue] = useState<number>(0);
  
  // Category dropdown state
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  // Filter section collapse/expand state
  const [isFilterSectionExpanded, setIsFilterSectionExpanded] = useState(true);
  const [filterSectionHeight] = useState(new Animated.Value(1));

  useEffect(() => {
    // Update parent component with filter values
    onFilterChange({
      searchTerm,
      selectedCategories,
      calories: { min: 0, max: caloriesValue > 0 ? caloriesValue : maxValues.calories },
      protein: { min: 0, max: proteinValue > 0 ? proteinValue : maxValues.protein },
      carbs: { min: 0, max: carbsValue > 0 ? carbsValue : maxValues.carbs },
      fat: { min: 0, max: fatValue > 0 ? fatValue : maxValues.fat }
    });
  }, [searchTerm, selectedCategories, caloriesValue, proteinValue, carbsValue, fatValue]);

  const toggleCategorySelection = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setCaloriesValue(0);
    setProteinValue(0);
    setCarbsValue(0);
    setFatValue(0);
    setIsCategoryDropdownOpen(false);
    closeDrawer();
  };

  const openDrawer = () => {
    setIsFilterVisible(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: DRAWER_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsFilterVisible(false);
    });
  };

  // Toggle filter section visibility
  const toggleFilterSection = () => {
    const newExpandedState = !isFilterSectionExpanded;
    setIsFilterSectionExpanded(newExpandedState);
    
    Animated.timing(filterSectionHeight, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Close category dropdown when collapsing
    if (!newExpandedState && isCategoryDropdownOpen) {
      setIsCategoryDropdownOpen(false);
    }
  };

  const renderSingleSlider = (
    title: string,
    value: number,
    maxValue: number,
    setValue: (value: number) => void,
    unit: string = 'g'
  ) => (
    <View className="mb-6">
      <View className="flex-row justify-between mb-2">
        <Text className="font-medium">{title}</Text>
        <Text className="text-text-secondary">{value}{unit}</Text>
      </View>
      <View className="items-center">
        <MultiSlider
          values={[value]}
          min={0}
          max={maxValue}
          step={1}
          sliderLength={Dimensions.get('window').width - 80}
          onValuesChange={(values) => setValue(values[0])}
          selectedStyle={{ backgroundColor: colors.primary.green }}
          unselectedStyle={{ backgroundColor: '#D1D1D6' }}
          containerStyle={{ height: 40 }}
          trackStyle={{ height: 4 }}
          markerStyle={{ 
            height: 20, 
            width: 20, 
            borderRadius: 10,
            backgroundColor: colors.primary.green,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2
          }}
        />
      </View>
    </View>
  );

  return (
    <View className="mb-4">
      {/* Search bar and toggle button */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 flex-1 mr-2">
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Søk etter oppskrifter..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {/* Toggle filter section button */}
        <TouchableOpacity 
          className="bg-white rounded-lg p-2"
          onPress={toggleFilterSection}
        >
          <Ionicons 
            name={isFilterSectionExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
            size={24} 
            color={colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Collapsible filter section */}
      <Animated.View style={{ 
        maxHeight: filterSectionHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 500] // Adjust this value based on your content
        }),
        overflow: 'hidden',
        opacity: filterSectionHeight
      }}>
        {/* Filter button and selected filters summary */}
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity 
            className="flex-row items-center bg-white rounded-lg px-3 py-2"
            onPress={openDrawer}
          >
            <Ionicons name="options-outline" size={20} color={colors.text.secondary} />
            <Text className="ml-2">Filter</Text>
          </TouchableOpacity>

          {/* Selected filters summary and reset button */}
          <View className="flex-row items-center">
            {selectedCategories.length > 0 && (
              <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2">
                <Text className="text-xs text-primary-green">{selectedCategories.length} kategorier</Text>
              </View>
            )}
            {caloriesValue > 0 && (
              <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2">
                <Text className="text-xs text-primary-green">Kalorier</Text>
              </View>
            )}
            {(proteinValue > 0 || carbsValue > 0 || fatValue > 0) && (
              <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2">
                <Text className="text-xs text-primary-green">Næring</Text>
              </View>
            )}
            
            {/* Only show reset button if any filter is active */}
            {(selectedCategories.length > 0 || searchTerm || caloriesValue > 0 || 
              proteinValue > 0 || carbsValue > 0 || fatValue > 0) && (
              <TouchableOpacity 
                onPress={resetFilters}
                className="bg-gray-200 rounded-full p-1"
              >
                <Ionicons name="close" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category dropdown */}
        <TouchableOpacity 
          className="flex-row justify-between items-center bg-white rounded-lg px-3 py-2 mb-2"
          onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
        >
          <Text>{selectedCategories.length > 0 ? `${selectedCategories.length} kategorier valgt` : 'Velg kategorier'}</Text>
          <Ionicons 
            name={isCategoryDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.text.secondary} 
          />
        </TouchableOpacity>

        {isCategoryDropdownOpen && (
          <View className="bg-white rounded-lg p-3 mb-2">
            <ScrollView style={{ maxHeight: 150 }}>
              {(categories || []).map(category => (
                <TouchableOpacity
                  key={category._id}
                  className="flex-row items-center py-2"
                  onPress={() => toggleCategorySelection(category._id)}
                >
                  <View className={`w-5 h-5 rounded border ${selectedCategories.includes(category._id) ? 'bg-primary-green border-primary-green' : 'border-gray-300'} mr-2 items-center justify-center`}>
                    {selectedCategories.includes(category._id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Show active filter indicators when collapsed */}
      {!isFilterSectionExpanded && (selectedCategories.length > 0 || caloriesValue > 0 || proteinValue > 0 || carbsValue > 0 || fatValue > 0) && (
        <View className="flex-row flex-wrap mt-1 mb-2">
          {selectedCategories.length > 0 && (
            <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-primary-green">{selectedCategories.length} kategorier</Text>
            </View>
          )}
          {caloriesValue > 0 && (
            <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-primary-green">Kalorier: {caloriesValue} kcal</Text>
            </View>
          )}
          {proteinValue > 0 && (
            <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-primary-green">Protein: {proteinValue}g</Text>
            </View>
          )}
          {carbsValue > 0 && (
            <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-primary-green">Karbs: {carbsValue}g</Text>
            </View>
          )}
          {fatValue > 0 && (
            <View className="bg-primary-green/10 rounded-full px-2 py-1 mr-2 mb-1">
              <Text className="text-xs text-primary-green">Fett: {fatValue}g</Text>
            </View>
          )}
          {(selectedCategories.length > 0 || caloriesValue > 0 || proteinValue > 0 || carbsValue > 0 || fatValue > 0) && (
            <TouchableOpacity 
              onPress={resetFilters}
              className="bg-gray-200 rounded-full p-1 mb-1 self-center"
            >
              <Ionicons name="close" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Bottom drawer for filters */}
      <Modal
        animationType="none"
        transparent={true}
        visible={isFilterVisible}
        onRequestClose={closeDrawer}
      >
        <View style={StyleSheet.absoluteFill} className="bg-black/30">
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={closeDrawer}
            activeOpacity={1}
          />
          <Animated.View 
            style={[
              styles.drawer,
              { transform: [{ translateY: drawerAnim }] }
            ]}
          >
            <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-4 mt-2" />
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Filtrer oppskrifter</Text>
              <TouchableOpacity onPress={closeDrawer}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              <Text className="text-text-secondary mb-4">Dra glidebryterne for å filtrere oppskrifter basert på næringsinnhold.</Text>
              
              {/* Calories slider */}
              {renderSingleSlider('Kalorier', caloriesValue, maxValues.calories, setCaloriesValue, ' kcal')}
              
              {/* Protein slider */}
              {renderSingleSlider('Protein', proteinValue, maxValues.protein, setProteinValue)}
              
              {/* Carbs slider */}
              {renderSingleSlider('Karbohydrater', carbsValue, maxValues.carbs, setCarbsValue)}
              
              {/* Fat slider */}
              {renderSingleSlider('Fett', fatValue, maxValues.fat, setFatValue)}

              {/* Action buttons */}
              <View className="flex-row justify-between mt-6 mb-10">
                <TouchableOpacity
                  className="bg-gray-200 rounded-lg px-4 py-3 flex-1 mr-2 items-center"
                  onPress={resetFilters}
                >
                  <Text>Nullstill alle filtre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-primary-green rounded-lg px-4 py-3 flex-1 ml-2 items-center"
                  onPress={closeDrawer}
                >
                  <Text className="text-white">Bruk filter</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: colors.primary.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  }
}); 