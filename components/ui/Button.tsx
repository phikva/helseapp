import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from 'react-native';
import { buttonStyles } from '../../lib/theme';
import { ArrowRightIcon } from '../Icon';
import { colors } from '../../lib/theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'transparent' | 'outline';
  children: string;
  textColor?: string;
}

/**
 * Button component that supports multiple visual variants.
 * 
 * This component uses a hybrid styling approach:
 * 1. Tailwind classes via NativeWind's className prop for structural styling
 * 2. Explicit React Native style objects for critical visual properties like background colors
 * 
 * The explicit style approach ensures background colors and other critical styles are 
 * consistently applied even if there are issues with Tailwind class processing in React Native.
 * 
 * The component now supports dynamic colors through the style prop and textColor prop.
 */
export function Button({ 
  variant = 'primary', 
  children, 
  className,
  style,
  textColor,
  ...props 
}: ButtonProps) {
  const styles = buttonStyles[variant];
  
  // Determine text color based on props or variant
  let finalTextColor = textColor;
  if (!finalTextColor) {
    finalTextColor = variant === 'secondary' ? 'white' : 'black';
  }

  // Create explicit style objects for each variant
  let variantStyle = {};
  
  if (variant === 'primary') {
    variantStyle = {
      backgroundColor: colors.primary.green,
      borderRadius: 9999, // rounded-full
      paddingVertical: 18,
      paddingHorizontal: 24,
    };
  } else if (variant === 'secondary') {
    variantStyle = {
      backgroundColor: colors.primary.black,
      borderRadius: 9999, // rounded-full
      paddingVertical: 18,
      paddingHorizontal: 24,
    };
  } else if (variant === 'outline') {
    variantStyle = {
      borderWidth: 2.5,
      borderColor: colors.primary.black,
      backgroundColor: 'transparent',
      borderRadius: 9999, // rounded-full
      paddingVertical: 18,
      paddingHorizontal: 24,
    };
  } else if (variant === 'transparent') {
    variantStyle = {
      backgroundColor: 'transparent',
      paddingVertical: 18,
      paddingHorizontal: 24,
    };
  }

  return (
    <TouchableOpacity
      className={`${styles.base} ${className || ''}`}
      style={[variantStyle, style]}
      {...props}
    >
      <Text 
        className={`${styles.text} ${variant === 'secondary' ? 'text-white' : ''}`}
        style={{ color: finalTextColor, fontFamily: 'Montaga-Regular', fontSize: 20 }}
      >
        {children}
      </Text>
      <ArrowRightIcon size={20} color={finalTextColor} />
    </TouchableOpacity>
  );
} 