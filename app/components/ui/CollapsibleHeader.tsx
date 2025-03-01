import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Platform, TextInput, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../lib/theme';

interface CollapsibleHeaderProps {
  title?: string;
  scrollY: Animated.Value;
  searchTerm?: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
  onResetFilters?: () => void;
  onRemoveFilter?: (filterName: string, filterValue: string) => void;
  showFilters?: boolean;
  hasActiveFilters?: boolean;
  activeTab?: 'all' | 'favorites';
  onTabChange?: (tab: 'all' | 'favorites') => void;
  recipesCount?: number;
  favoritesCount?: number;
  backgroundColor?: string;
  textColor?: string;
  activeFilters?: { name: string; value: string }[];
  filteredCount?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

// Base header height without filters
const BASE_HEADER_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = 100;
// Add padding for filters
const FILTERS_PADDING = 8;

export default function CollapsibleHeader({
  title = 'Oppskrifter',
  scrollY,
  searchTerm = '',
  onSearchChange,
  onFilterPress,
  onResetFilters,
  onRemoveFilter,
  showFilters = false,
  hasActiveFilters = false,
  activeTab = 'all',
  onTabChange,
  recipesCount,
  favoritesCount,
  backgroundColor = '#FCFCEC',
  textColor = '#4A6C62',
  activeFilters = [],
  filteredCount,
  viewMode = 'grid',
  onViewModeChange,
}: CollapsibleHeaderProps) {
  const insets = useSafeAreaInsets();
  const [filtersHeight, setFiltersHeight] = useState(0);
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(true);
  const animatedValue = useRef(new Animated.Value(0)).current; // Start with header visible (0)
  const isScrolling = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const previousFiltersHeight = useRef(filtersHeight);
  
  // Calculate dynamic header height based on whether filters are active
  const headerHeight = BASE_HEADER_HEIGHT + (hasActiveFilters ? filtersHeight + FILTERS_PADDING : 0);
  const totalHeaderHeight = headerHeight + insets.top;

  // Measure the height of the filters section when it changes
  const onFilterLayoutChange = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height !== previousFiltersHeight.current) {
      previousFiltersHeight.current = height;
      setFiltersHeight(height);
    }
  };

  // Reset scroll position and show header when tab changes
  useEffect(() => {
    // Reset scroll position to top
    scrollY.setValue(0);
    lastScrollY.current = 0;
    
    // Show header
    Animated.timing(animatedValue, {
      toValue: 0, // Show header
      duration: 0, // Immediate
      useNativeDriver: true,
    }).start();
  }, [activeTab]); // Add activeTab as a dependency

  // Track scroll direction and position
  useEffect(() => {
    // Initialize header as visible
    Animated.timing(animatedValue, {
      toValue: 0, // Show header
      duration: 0, // Immediate
      useNativeDriver: true,
    }).start();
    
    const listener = scrollY.addListener(({ value }) => {
      // Check if at the top
      const isAtTop = value <= 5; // Small threshold to account for bounce effects
      
      // Check scroll direction
      const isDown = value > lastScrollY.current;
      
      // Mark as scrolling and clear any existing timer
      isScrolling.current = true;
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      
      // Set a timer to detect when scrolling stops
      scrollTimer.current = setTimeout(() => {
        isScrolling.current = false;
        
        // If we stopped scrolling while going down, keep header hidden
        if (isScrollingDown.current && !isAtTop) {
          Animated.timing(animatedValue, {
            toValue: 1, // Hide header
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }, 150);
      
      if (isAtTop) {
        // Always show header when at the top
        Animated.timing(animatedValue, {
          toValue: 0, // Show header
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else if (isDown !== isScrollingDown.current) {
        // Direction changed
        isScrollingDown.current = isDown;
        
        if (!isDown) {
          // Only show header when actively scrolling up
          Animated.timing(animatedValue, {
            toValue: 0, // Show header
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          // Hide header when scrolling down
          Animated.timing(animatedValue, {
            toValue: 1, // Hide header
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }
      
      lastScrollY.current = value;
    });
    
    return () => {
      scrollY.removeListener(listener);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  // Calculate header translation
  const headerTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -totalHeaderHeight],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: totalHeaderHeight,
          backgroundColor,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
      className="shadow-sm"
    >
      {/* Title Section */}
      <View className="px-4 pt-0">
        <Text className="text-4xl font-heading-serif text-primary-black">{title}</Text>
      </View>
      
      {/* Search Bar */}
      <View className="px-4 mt-2">
        <View className="flex-row items-center">
          <View className="flex-row items-center bg-white rounded-lg px-3 py-2 flex-1">
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              className="flex-1 ml-2 text-text-primary"
              placeholder="Søk etter oppskrifter..."
              value={searchTerm}
              onChangeText={onSearchChange}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => onSearchChange?.('')}>
                <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {/* View Mode Toggle Button */}
          {onViewModeChange && (
            <TouchableOpacity 
              className="rounded-lg py-2 px-3 ml-2 bg-white flex-row items-center"
              onPress={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons 
                name={viewMode === 'grid' ? "list-outline" : "grid-outline"} 
                size={20} 
                color="#4A6C62" 
              />
            </TouchableOpacity>
          )}
          
          {/* Filter Button */}
          <TouchableOpacity 
            className={`rounded-lg py-2 px-3 ml-2 flex-row items-center ${showFilters ? 'bg-primary-green' : 'bg-white'}`}
            onPress={onFilterPress}
          >
            <Ionicons 
              name="options-outline" 
              size={20} 
              color={showFilters ? '#FFFFFF' : '#4A6C62'} 
            />
            <Text className={`ml-1 ${showFilters ? 'text-white' : 'text-primary-green'}`}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <View 
            className="mt-4 mb-2"
            onLayout={onFilterLayoutChange}
          >
            <View className="flex-row flex-wrap items-center">
              {/* Display active filter tags */}
              {activeFilters.map((filter, index) => (
                <View key={index} className="bg-gray-200 rounded-lg px-3 py-1.5 mr-2 mb-2 flex-row items-center">
                  <Text className="text-gray-700 text-sm">{filter.name}: {filter.value}</Text>
                  {onRemoveFilter && (
                    <TouchableOpacity 
                      onPress={() => onRemoveFilter(filter.name, filter.value)}
                      className="ml-1"
                    >
                      <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {/* Display search term as a filter if present */}
              {searchTerm ? (
                <View className="bg-gray-200 rounded-lg px-3 py-1.5 mr-2 mb-2 flex-row items-center">
                  <Text className="text-gray-700 text-sm">Søk: {searchTerm}</Text>
                  <TouchableOpacity 
                    onPress={() => onSearchChange?.('')}
                    className="ml-1"
                  >
                    <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ) : null}
              
              {/* Reset Filters Button */}
              <TouchableOpacity 
                onPress={onResetFilters}
                className="bg-gray-200 rounded-lg px-3 py-1.5 mb-2"
              >
                <Text className="text-gray-600 text-sm">Tilbakestill alle</Text>
              </TouchableOpacity>
            </View>
            
            {/* Display filtered count */}
            {filteredCount !== undefined && (
              <Text className="text-gray-600 text-sm mt-1 mb-1">
                Viser {filteredCount} {filteredCount === 1 ? 'oppskrift' : 'oppskrifter'} basert på filtre
              </Text>
            )}
          </View>
        )}
      </View>
      
      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200 mx-4 mt-4">
        <TouchableOpacity 
          className={`py-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-primary-green' : ''}`}
          onPress={() => onTabChange?.('all')}
        >
          <Text className={`${activeTab === 'all' ? 'text-primary-green font-medium' : 'text-gray-600'}`}>
            Alle oppskrifter {hasActiveFilters && activeTab === 'all' && filteredCount !== undefined 
              ? ` (${filteredCount})` 
              : recipesCount !== undefined ? ` (${recipesCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`py-2 px-4 ${activeTab === 'favorites' ? 'border-b-2 border-primary-green' : ''}`}
          onPress={() => onTabChange?.('favorites')}
        >
          <Text className={`${activeTab === 'favorites' ? 'text-primary-green font-medium' : 'text-gray-600'}`}>
            Favoritter {hasActiveFilters && activeTab === 'favorites' && filteredCount !== undefined 
              ? ` (${filteredCount})` 
              : favoritesCount !== undefined ? ` (${favoritesCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
}); 