import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { urlFor } from './sanity';
import { ImageSourcePropType } from 'react-native';

// Import all fallback images statically
const fallbackImageSources = {
  'pexels-bulbfish-1143754': require('../assets/images/pexels-bulbfish-1143754.jpg'),
  'pexels-ella-olsson-572949-1640770': require('../assets/images/pexels-ella-olsson-572949-1640770.jpg'),
  'pexels-ella-olsson-572949-3026806': require('../assets/images/pexels-ella-olsson-572949-3026806.jpg'),
  'pexels-helloaesthe-30926470': require('../assets/images/pexels-helloaesthe-30926470.jpg'),
  'pexels-ionela-mat-268382825-19671313': require('../assets/images/pexels-ionela-mat-268382825-19671313.jpg'),
  'pexels-janetrangdoan-793759': require('../assets/images/pexels-janetrangdoan-793759.jpg')
};

// Array of fallback image keys for deterministic selection
const fallbackImageKeys = Object.keys(fallbackImageSources);

/**
 * Gets a source for a recipe image, with fallback to a deterministic placeholder if no image exists
 * @param image The Sanity image source
 * @param width Optional width to resize the image
 * @param height Optional height to resize the image
 * @param recipeId Optional recipe ID for deterministic fallback selection
 * @returns An image source object for React Native Image component
 */
export function getRecipeImageSource(
  image: SanityImageSource | null | undefined, 
  width?: number, 
  height?: number,
  recipeId?: string
): ImageSourcePropType {
  // If there's a valid Sanity image, use urlFor to generate the URL
  if (image) {
    let imageUrl = urlFor(image);
    if (width) imageUrl = imageUrl.width(width);
    if (height) imageUrl = imageUrl.height(height);
    return { uri: imageUrl.url() };
  }
  
  // For fallback images, use a deterministic approach based on recipeId if available
  if (recipeId) {
    // Create a simple hash from the recipeId
    let hash = 0;
    for (let i = 0; i < recipeId.length; i++) {
      hash = ((hash << 5) - hash) + recipeId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use the absolute value of hash to select an image
    const index = Math.abs(hash) % fallbackImageKeys.length;
    const fallbackImageKey = fallbackImageKeys[index];
    
    return fallbackImageSources[fallbackImageKey as keyof typeof fallbackImageSources];
  }
  
  // If no recipeId is provided, fall back to random selection (should be rare)
  const randomIndex = Math.floor(Math.random() * fallbackImageKeys.length);
  const fallbackImageKey = fallbackImageKeys[randomIndex];
  
  return fallbackImageSources[fallbackImageKey as keyof typeof fallbackImageSources];
} 