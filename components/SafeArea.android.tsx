import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

interface SafeAreaProps {
  children: ReactNode;
  style?: any;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  backgroundColor?: string;
  includeStatusBarHeight?: boolean;
}

/**
 * Android-specific SafeArea component
 * 
 * @param children - The content to render inside the safe area
 * @param style - Additional styles to apply to the container
 * @param edges - Which edges to apply safe area padding to (default: all)
 * @param backgroundColor - Background color of the safe area
 * @param includeStatusBarHeight - Whether to include status bar height (default: true)
 */
export default function SafeArea({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
  backgroundColor,
  includeStatusBarHeight = true,
}: SafeAreaProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  
  // Default background color based on color scheme
  const defaultBgColor = colorScheme === 'dark' ? '#000' : '#fff';
  
  // Set status bar color to match background
  StatusBar.setBackgroundColor(backgroundColor || defaultBgColor);
  StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
  
  // Calculate padding based on edges and whether to include status bar height
  const padding = {
    paddingTop: edges.includes('top') && includeStatusBarHeight 
      ? StatusBar.currentHeight || insets.top 
      : 0,
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