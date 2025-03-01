import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

interface SafeAreaProps {
  children: ReactNode;
  style?: any;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  backgroundColor?: string;
  includeStatusBarHeight?: boolean; // Included for API compatibility but not used on iOS
}

/**
 * iOS-specific SafeArea component with optimized padding
 * 
 * @param children - The content to render inside the safe area
 * @param style - Additional styles to apply to the container
 * @param edges - Which edges to apply safe area padding to (default: all)
 * @param backgroundColor - Background color of the safe area
 */
export default function SafeArea({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
  backgroundColor,
}: SafeAreaProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  
  // Default background color based on color scheme
  const defaultBgColor = colorScheme === 'dark' ? '#000' : '#fff';
  
  // Calculate padding based on edges
  // For iOS, we use a more conservative top padding to avoid excessive space
  const padding = {
    paddingTop: edges.includes('top') ? (style?.paddingTop !== undefined ? style.paddingTop : insets.top) : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
  };

  return (
    <View 
      style={[
        styles.container,
        padding,
        { backgroundColor: backgroundColor || defaultBgColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 