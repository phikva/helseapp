import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { urlFor } from './sanity';
import { ImageSourcePropType } from 'react-native';

// Placeholder for fallback images
const placeholderImageUri = 'https://via.placeholder.com/400x200.png?text=No+Image';

/**
 * Gets a source for a recipe image, with fallback to a placeholder if no image exists
 * @param image The Sanity image source
 * @param width Optional width to resize the image
 * @param height Optional height to resize the image
 * @param recipeId Optional recipe ID (not used in this implementation)
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
  
  // For fallback, use a placeholder image
  return { uri: placeholderImageUri };
} 