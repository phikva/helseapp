# Helseapp Codebase Reference

## Project Overview
A React Native application built with Expo, using TypeScript and following modern development practices. The app implements a health-focused application with features for recipes, categories, and shopping cart functionality.

## Tech Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Backend Integration**: Supabase & Sanity
- **Authentication**: Built-in auth system

## Directory Structure

### Root Level Directories
- `/app` - Main application code using file-based routing (Expo Router)
- `/components` - Reusable UI components
- `/constants` - Application-wide constants and configurations
- `/contexts` - React Context providers
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/assets` - Static assets (images, fonts, etc.)
- `/lib` - Utility functions and shared logic
- `/config` - Configuration files

### Key Application Directories (`/app`)
- `/(auth)` - Authentication related screens and logic
- `/(tabs)` - Main tab navigation screens
- `/cart` - Shopping cart functionality
- `/recipe` - Recipe related screens
- `/category` - Category management
- `/categories` - Category listing and navigation
- `/components` - Page-specific components
- `/lib` - Route-specific utilities

## Key Configuration Files
- `package.json` - Project dependencies and scripts
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - TailwindCSS/NativeWind configuration
- `babel.config.js` - Babel configuration
- `.env` - Environment variables (not tracked in git)

## Main Dependencies
- **UI/UX**:
  - @expo/vector-icons
  - react-native-heroicons
  - moti (animations)
  - nativewind

- **Navigation**:
  - expo-router
  - @react-navigation/native
  - @react-navigation/bottom-tabs

- **Data Management**:
  - @supabase/supabase-js
  - @sanity/client
  - zustand (state management)

- **Storage**:
  - @react-native-async-storage/async-storage

## Sanity Schema Structure
The application uses Sanity.io as a headless CMS with the following key schemas:

- **tier**: Consolidated subscription schema that handles all subscription-related data
  - Contains pricing information, features, and access levels
  - Includes fields for recipe access limits, meal storage duration, and favorite recipe limits
  - Replaces the previous separate 'subscription' and 'tier' schemas for better maintainability

- **kategori**: Category schema for organizing recipes
- **oppskrift**: Recipe schema with detailed recipe information
- **brukerprofil**: User profile schema
- **page/section**: Content structure schemas
- **onboarding**: Onboarding experience schemas

### Sanity Image Handling
The application includes special handling for images from Sanity, including SVG support:

- **SanityImageComponent**: A custom component that handles both regular images and SVG files
  - Uses metadata from Sanity to detect SVG files (extension and mimeType properties)
  - Falls back to URL extension check if metadata isn't available
  - Renders SVGs using `SvgUri` from `react-native-svg`
  - Provides fallback to regular image rendering if SVG loading fails

- **Schema Configuration**: All image fields in Sanity schemas include:
  - `accept: 'image/svg+xml,image/*'` to explicitly allow SVG uploads
  - `storeOriginalFilename: true` to preserve filename information
  - `metadata` collection for better file type detection

```typescript
// Example image field configuration in Sanity schemas
defineField({
  name: 'image',
  title: 'Image',
  type: 'image',
  options: {
    hotspot: true,
    accept: 'image/svg+xml,image/*',
    storeOriginalFilename: true,
    metadata: ['exif', 'location', 'lqip', 'palette', 'blurhash'],
  },
  description: 'Image field (supports SVG files)',
})
```

## Development Practices
1. **File Structure**:
   - File-based routing using Expo Router
   - Component-based architecture
   - Separation of concerns between UI and logic

2. **Code Organization**:
   - Shared components in `/components`
   - Page-specific components within route directories
   - Utility functions in `/lib`
   - Type definitions in `/types`

3. **State Management**:
   - Zustand for global state
   - React Context for theme/auth state
   - AsyncStorage for persistent storage

4. **Styling**:
   - TailwindCSS through NativeWind
   - Consistent design system
   - Responsive layouts
   - Hybrid styling approach for critical components (see Button component)
     - Combines Tailwind classes with explicit React Native style objects
     - Ensures consistent rendering of critical visual properties like background colors
     - Prevents styling issues that can occur with NativeWind class processing

5. **Navigation**:
   - Consistent back button implementation using the `BackButton` component
   - Screen headers using the `ScreenHeader` component
   - Navigation history is preserved using Expo Router's navigation system

## Reusable Components

### Button
A reusable button component that supports multiple visual variants using a hybrid styling approach:
```typescript
// components/ui/Button.tsx
export function Button({ 
  variant = 'primary', 
  children, 
  className,
  style,
  ...props 
}: ButtonProps) {
  // Uses both Tailwind classes and explicit style objects
  // to ensure consistent rendering of background colors
  const styles = buttonStyles[variant];
  const textColor = variant === 'secondary' ? 'white' : 'black';
  
  // Explicit style objects for critical visual properties
  let variantStyle = {};
  if (variant === 'primary') {
    variantStyle = {
      backgroundColor: colors.primary.green,
      borderRadius: 9999, // rounded-full
      paddingVertical: 18,
      paddingHorizontal: 24,
    };
  }
  // Additional variants...
  
  return (
    <TouchableOpacity
      className={`${styles.base} ${className || ''}`}
      style={[variantStyle, style]}
      {...props}
    >
      <Text className={`${styles.text}`} style={{ color: textColor }}>
        {children}
      </Text>
      <ArrowRightIcon size={20} color={textColor} />
    </TouchableOpacity>
  );
}
```

### SanityImage
A reusable component that handles both regular images and SVG files from Sanity:
```typescript
// components/SanityImage.tsx
export function SanityImageComponent({ source, width, height, ...props }: SanityImageProps) {
  const [isSvg, setIsSvg] = useState<boolean | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check if the source is an SVG based on Sanity metadata
    const checkIfSvg = () => {
      // If source is an object with extension property
      if (source && typeof source === 'object' && source.asset && source.asset.extension) {
        setIsSvg(source.asset.extension.toLowerCase() === 'svg')
        return
      }
      
      // If source is an object with mimeType property
      if (source && typeof source === 'object' && source.asset && source.asset.mimeType) {
        setIsSvg(source.asset.mimeType.toLowerCase().includes('svg'))
        return
      }
      
      // Fallback to URL check
      const imageUrl = urlFor(source).url()
      setIsSvg(imageUrl.toLowerCase().endsWith('.svg'))
    }
    
    checkIfSvg()
  }, [source])

  // Generate the image URL using Sanity's URL builder
  const imageUrl = urlFor(source)
    .auto('format')
    .fit('max')

  if (width) imageUrl.width(width)
  if (height) imageUrl.height(height)

  const finalUrl = imageUrl.url()

  // Render SVG or regular image based on detection
  if (isSvg) {
    return <SvgUri width={width} height={height} uri={finalUrl} />
  } else {
    return <Image source={{ uri: finalUrl }} style={{ width, height }} {...props} />
  }
}
```

### BackButton
A reusable back button component that remembers the last place it came from:
```typescript
// components/ui/BackButton.tsx
export function BackButton({
  label = 'Tilbake',
  color = '#0891b2',
  iconSize = 24,
  ...props
}: BackButtonProps) {
  // Component implementation
}
```

### ScreenHeader
A reusable screen header component that includes a title and optional back button:
```typescript
// components/ui/ScreenHeader.tsx
export function ScreenHeader({
  title,
  showBackButton = true,
  backButtonLabel = 'Tilbake',
  backgroundColor = 'white',
}: ScreenHeaderProps) {
  // Component implementation
}
```

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in required API keys and configurations

3. Start development server:
   ```bash
   npm start
   ```

## Best Practices
1. Follow TypeScript strict mode guidelines
2. Use component composition for UI elements
3. Implement proper error handling
4. Follow the established folder structure
5. Write clean, maintainable code
6. Use proper typing for all components and functions
7. Use the BackButton component for consistent navigation
8. Use the ScreenHeader component for consistent headers
9. Follow the Single Responsibility Principle for schemas and components
10. Use the hybrid styling approach for components with critical visual properties

## Common Patterns
1. **Component Structure**:
   ```typescript
   interface Props {
     // Component props
   }

   export function ComponentName({ prop1, prop2 }: Props) {
     // Component logic
     return (
       // JSX
     )
   }
   ```

2. **Hook Usage**:
   ```typescript
   export function useCustomHook() {
     // Hook logic
     return {
       // Hook return values
     }
   }
   ```

3. **Route Structure**:
   ```typescript
   export default function RouteName() {
     // Route component logic
     return (
       // JSX with ScreenHeader for consistent navigation
       <View>
         <ScreenHeader title="Page Title" />
         {/* Page content */}
       </View>
     )
   }
   ```

4. **Hybrid Styling Pattern**:
   ```typescript
   // For components with critical visual properties
   <Component
     className="tailwind-classes-for-structure"
     style={explicitStylesForCriticalProperties}
   />
   ```

## Maintenance and Updates
- Regular dependency updates
- Code review process
- Testing requirements
- Documentation updates

## Recent Schema Changes
- **2023-Q4**: Consolidated subscription and tier schemas into a single 'tier' schema
  - Improved data model by removing redundancy
  - Simplified subscription management
  - All subscription-related code should now reference the 'tier' schema

## Styling Troubleshooting
If you encounter styling issues, particularly with background colors not appearing:

1. Check if the component uses the hybrid styling approach
2. Ensure explicit style objects are defined for critical visual properties
3. Verify that the colors in `lib/theme.ts` match those in `tailwind.config.js`
4. For button components, refer to the Button implementation which uses explicit style objects for background colors

## SVG Troubleshooting
If you encounter issues with SVG files not displaying in Sanity components:

1. **Check the SanityImage component**: Ensure the `SanityImageComponent` is being used to render Sanity images
2. **Verify SVG detection**: The component uses multiple methods to detect SVGs:
   - Checking for `extension` property in the Sanity asset metadata
   - Checking for `mimeType` property in the Sanity asset metadata
   - Falling back to URL extension check
3. **Schema configuration**: Ensure image fields in Sanity schemas include:
   - `accept: 'image/svg+xml,image/*'`
   - `storeOriginalFilename: true`
   - Appropriate metadata collection
4. **Metro configuration**: Verify that `metro.config.js` is properly configured for SVG handling
5. **Dependencies**: Ensure `react-native-svg` and `react-native-svg-transformer` are installed

For newly uploaded SVGs, you may need to clear the Sanity CDN cache or wait for cache invalidation to see changes.

This document serves as a living reference and should be updated as the project evolves. 