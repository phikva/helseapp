/**
 * Application color palette based on Tailwind CSS colors
 * This centralizes all color definitions for consistent theming
 * 
 * This file re-exports the colors from lib/theme.ts which is the single source of truth
 * for all design tokens in the application.
 */
import { colors as themeColors } from '../lib/theme';

// Re-export the theme colors with additional semantic colors
const colors = {
  // Primary colors
  primary: {
    green: themeColors.primary.Green,
    black: themeColors.primary.Black,
    cyan: '#0891b2', // cyan-600 - to be added to Tailwind config
  },
  
  // Text colors
  text: {
    primary: themeColors.text.DEFAULT,
    secondary: themeColors.text.secondary,
    white: themeColors.text.white,
  },
  
  // Background colors
  white: themeColors.background.DEFAULT,
  background: {
    default: themeColors.background.DEFAULT,
    secondary: themeColors.background.secondary,
  },
  
  // Semantic colors - to be added to Tailwind config
  success: '#22C55E', // green-500
  error: '#EF4444', // red-500
  warning: '#F59E0B', // amber-500
  info: '#3B82F6', // blue-500
};

export default colors; 