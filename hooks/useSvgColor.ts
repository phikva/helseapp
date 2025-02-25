import { useState, useEffect } from 'react';
import { urlFor } from '../lib/sanity';
import { colors } from '../lib/theme';

// Define a type for the color mapping
export type ColorMapping = {
  primary: string;
  text: string;
  background?: string;
};

// Default color mapping using the theme colors
const defaultColorMapping: ColorMapping = {
  primary: colors.primary.green,
  text: colors.primary.green,
  background: colors.background.DEFAULT,
};

// Map of predefined colors we want to detect in SVGs
const colorDetectionMap: Record<string, ColorMapping> = {
  // Green (default)
  '#4A6C62': {
    primary: colors.primary.green,
    text: colors.primary.green,
  },
  // Purple
  '#752167': {
    primary: colors.primary.purple,
    text: colors.primary.purple,
  },
  // Cyan
  '#055976': {
    primary: colors.primary.cyan,
    text: colors.primary.cyan,
  },
  // Add more color mappings as needed
};

/**
 * Hook to extract dominant color from an SVG file
 * 
 * @param source The Sanity image source
 * @returns An object with primary and text colors
 */
export function useSvgColor(source: any): ColorMapping {
  const [colorMapping, setColorMapping] = useState<ColorMapping>(defaultColorMapping);
  const [isSvg, setIsSvg] = useState<boolean>(false);

  useEffect(() => {
    // First determine if it's an SVG
    const checkIfSvg = () => {
      // If source is an object with extension property
      if (source && typeof source === 'object' && source.asset && source.asset.extension) {
        return source.asset.extension.toLowerCase() === 'svg';
      }
      
      // If source is an object with mimeType property
      if (source && typeof source === 'object' && source.asset && source.asset.mimeType) {
        return source.asset.mimeType.toLowerCase().includes('svg');
      }
      
      // Fallback to URL check
      const imageUrl = urlFor(source).url();
      return imageUrl.toLowerCase().endsWith('.svg');
    };
    
    const isSvgFile = checkIfSvg();
    setIsSvg(isSvgFile);

    if (!isSvgFile) {
      return;
    }

    // For SVGs, fetch the content and extract color
    const extractColorFromSvg = async () => {
      try {
        const imageUrl = urlFor(source).url();
        const response = await fetch(imageUrl);
        const svgText = await response.text();
        
        // Look for fill or stroke attributes with color values
        const colorMatches = svgText.match(/(fill|stroke)="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\))"/g);
        
        if (colorMatches && colorMatches.length > 0) {
          // Extract the color values
          const colorValues = colorMatches.map(match => {
            const colorValue = match.match(/"([^"]+)"/);
            return colorValue ? colorValue[1] : null;
          }).filter(Boolean);
          
          // Find the first color that matches our predefined colors
          for (const colorValue of colorValues) {
            if (colorValue && colorDetectionMap[colorValue]) {
              setColorMapping(colorDetectionMap[colorValue]);
              return;
            }
          }
          
          // If no match found but we have colors, use the first one
          if (colorValues.length > 0 && colorValues[0]) {
            // Create a custom mapping for this color
            setColorMapping({
              primary: colorValues[0],
              text: colorValues[0],
            });
            return;
          }
        }
        
        // Fallback to default if no colors found
        setColorMapping(defaultColorMapping);
      } catch (error) {
        console.error('Error extracting color from SVG:', error);
        setColorMapping(defaultColorMapping);
      }
    };
    
    extractColorFromSvg();
  }, [source]);

  return colorMapping;
} 