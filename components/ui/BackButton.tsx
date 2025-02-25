import React from 'react';
import { TouchableOpacity, Text, View, TouchableOpacityProps } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../lib/theme';

interface BackButtonProps extends TouchableOpacityProps {
  label?: string;
  color?: string;
  iconSize?: number;
}

/**
 * A reusable back button component that navigates back to the previous screen
 * using the router's back() method, which preserves navigation history.
 */
export function BackButton({
  label = 'Tilbake',
  color = colors.primary.Black, // Using cyan from our theme
  iconSize = 24,
  style,
  ...props
}: BackButtonProps) {
  const router = useRouter();
  const navigation = useNavigation();

  // Check if we can go back
  const canGoBack = navigation.canGoBack();

  const handlePress = () => {
    if (canGoBack) {
      router.back();
    } else {
      // Fallback to home if we can't go back
      router.replace('/(tabs)');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center"
      accessibilityLabel="Go back to previous screen"
      accessibilityRole="button"
      {...props}
    >
      <Ionicons name="chevron-back" size={iconSize} color={color} />
      {label && (
        <Text style={{ color, marginLeft: 2, fontFamily: fonts.body.medium }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
} 