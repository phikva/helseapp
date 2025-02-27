import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Animated, Dimensions, StyleSheet, PanResponder } from 'react-native';
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
  hideCategoryFilter?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.8;

const RecipeFilters = forwardRef(({ onFilterChange, maxValues, hideCategoryFilter = false }: RecipeFiltersProps, ref) => {
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
  
  // Pan responder for draggable drawer
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow dragging down
          drawerAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAWER_HEIGHT / 3) {
          // If dragged down more than 1/3 of drawer height, close it
          closeDrawer();
        } else {
          // Otherwise snap back to open position
          Animated.spring(drawerAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    console.log('Selected categories in RecipeFilters:', selectedCategories);
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

  // Reset local state when parent component resets filters
  useEffect(() => {
    // Check if all filters are reset in the parent component
    const parentFiltersReset = 
      maxValues && 
      !selectedCategories.length && 
      !searchTerm && 
      !caloriesValue && 
      !proteinValue && 
      !carbsValue && 
      !fatValue;
    
    if (parentFiltersReset) {
      resetFilters();
    }
  }, [maxValues]);

  // Expose resetFilters function via ref
  useImperativeHandle(ref, () => ({
    resetFilters
  }));

  const toggleCategorySelection = (categoryId: string) => {
    console.log('Toggling category:', categoryId);
    console.log('Current selected categories:', selectedCategories);
    
    // Find the category name for logging
    const categoryName = categories.find(cat => cat._id === categoryId)?.name || 'Unknown';
    
    let newCategories;
    
    if (selectedCategories.includes(categoryId)) {
      console.log(`Removing category: ${categoryName} (${categoryId})`);
      newCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      console.log(`Adding category: ${categoryName} (${categoryId})`);
      newCategories = [...selectedCategories, categoryId];
    }
    
    console.log('New selected categories:', newCategories);
    setSelectedCategories(newCategories);
    
    // Immediately update parent component with new categories
    const updatedFilters = {
      searchTerm,
      selectedCategories: newCategories,
      calories: { min: 0, max: caloriesValue > 0 ? caloriesValue : maxValues.calories },
      protein: { min: 0, max: proteinValue > 0 ? proteinValue : maxValues.protein },
      carbs: { min: 0, max: carbsValue > 0 ? carbsValue : maxValues.carbs },
      fat: { min: 0, max: fatValue > 0 ? fatValue : maxValues.fat }
    };
    
    console.log('Sending updated filters to parent:', updatedFilters);
    onFilterChange(updatedFilters);
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
    
    // Explicitly update parent component with reset values
    onFilterChange({
      searchTerm: '',
      selectedCategories: [],
      calories: { min: 0, max: maxValues.calories },
      protein: { min: 0, max: maxValues.protein },
      carbs: { min: 0, max: maxValues.carbs },
      fat: { min: 0, max: maxValues.fat }
    });
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
    <View className="mb-0">
      {/* Search bar and toggle button */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 flex-1">
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
      </View>

      {/* Collapsible filter section */}
      <View>
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
      </View>

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
            {/* Draggable handle */}
            <View {...panResponder.panHandlers}>
              <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-4 mt-2" />
            </View>
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Filtrer oppskrifter</Text>
              <TouchableOpacity onPress={closeDrawer}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Categories section - only show if not hidden */}
              {!hideCategoryFilter && (
                <View className="mb-6">
                  <Text className="font-medium mb-2">Kategorier</Text>
                  
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
                    <View className="bg-white rounded-lg p-3 mb-4">
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
                </View>
              )}
              
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
});

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

export default RecipeFilters; 