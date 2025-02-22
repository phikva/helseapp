/**
 * Component-specific styles that build upon our Tailwind design tokens.
 * For base design tokens (colors, typography, etc.), see tailwind.config.js
 */

export const colors = {
  primary: {
    Green: '#BCDCC4',
    Black: '#1C1C1E',
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

export const fonts = {
  heading: {
    bold: 'SharpGrotesk-Bold20',
    medium: 'SharpGrotesk-Medium20',
    book: 'SharpGrotesk-Book20',
  },
  body: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
} as const;

export const buttonStyles = {
  primary: {
    base: "bg-primary-Green py-[18px] px-6 rounded-full flex-row items-center justify-between",
    text: "text-xl font-medium text-primary-Black",
  },
  secondary: {
    base: "bg-primary-Black py-[18px] px-6 rounded-full flex-row items-center justify-between",
    text: "text-xl ont-medium text-white",
  },
  transparent: {
    base: "py-[18px] px-6 flex-row items-center",
    text: "text-xl font-medium text-primary-Black",
  },
} as const;

export const layout = {
  padding: {
    default: "px-5",
    large: "px-6",
  },
  spacing: {
    default: "gap-[8px]",
    large: "gap-3",
  },
} as const; 