/**
 * Component-specific styles that build upon our Tailwind design tokens.
 * For base design tokens (colors, typography, etc.), see tailwind.config.js
 */

// Re-export the colors from Tailwind config for use in JS/TS code
export const colors = {
  primary: {
    green: '#4A6C62', // Light green from Tailwind config
    black: '#1C1C1E', // Dark color from Tailwind config
    cyan: '#055976',  // Cyan color for accents
    light: '#FCFCEC',
    purple: '#752167',
  },
  text: {
    DEFAULT: '#000000',
    secondary: '#3C3C43',
    white: '#FFFFFF',
  },
  background: {
    DEFAULT: '#FFFFFF',
    secondary: '#F5F5F5',
  },
} as const;

// Re-export the fonts from Tailwind config
export const fonts = {
  heading: {
    bold: 'SharpGrotesk-Bold20',
    medium: 'SharpGrotesk-Medium20',
    book: 'SharpGrotesk-Book20',
    serif: 'Montaga-Regular',
  },
  body: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
} as const;

/**
 * Component-specific styles that use the design tokens.
 * 
 * NOTE: For React Native components, these Tailwind classes should be used alongside
 * explicit style objects for critical visual properties like background colors.
 * 
 * See the Button component implementation for an example of this hybrid approach,
 * which ensures styles are consistently applied even if there are issues with
 * Tailwind class processing in React Native.
 */
export const buttonStyles = {
  primary: {
    base: "bg-primary-green py-[18px] px-6 rounded-full flex-row items-center justify-between",
    text: "text-xl font-heading-serif text-primary-black",
  },
  secondary: {
    base: "bg-primary-black py-[18px] px-6 rounded-full flex-row items-center justify-between",
    text: "text-xl font-heading-serif text-text-white",
  },
  transparent: {
    base: "py-[18px] px-6 flex-row items-center",
    text: "text-xl font-heading-serif text-primary-black",
  },
  outline: {
    base: "bg-transparent border-[2.5px] border-[#1C1C1E] py-[18px] px-6 rounded-full flex-row items-center justify-between",
    text: "text-xl font-heading-serif text-primary-black",
  },
} as const;

export const layout = {
  padding: {
    default: "px-5",
    large: "px-6",
  },
  spacing: {
    default: "gap-2",
    large: "gap-3",
  },
} as const; 