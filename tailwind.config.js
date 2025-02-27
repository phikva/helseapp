/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#4A6C62', // Light green color from your button
          black: '#1C1C1E',    // Dark color from your button
          cyan: '#055976',     // Cyan color for accents
          light: '#FCFCEC',
          purple: '#752167',
          pink: '#B5548C',     // Lighter purple/pink that complements the existing purple
          blue: '#0A3A5A',     // Deeper blue that complements the existing cyan
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
      },
      fontSize: {
        // Display
        'display-large': ['40px', { lineHeight: '48px' }],
        'display-medium': ['36px', { lineHeight: '44px' }],
        'display-small': ['32px', { lineHeight: '40px' }],
        // Heading
        'heading-large': ['24px', { lineHeight: '32px' }],
        'heading-medium': ['20px', { lineHeight: '28px' }],
        'heading-small': ['18px', { lineHeight: '24px' }],
        // Body
        'body-large': ['17px', { lineHeight: '24px' }],
        'body-medium': ['15px', { lineHeight: '22px' }],
        'body-small': ['13px', { lineHeight: '20px' }],
      },
      fontFamily: {
        // Headings
        'heading-bold': ['SharpGrotesk-Bold20'],
        'heading-medium': ['SharpGrotesk-Medium20'],
        'heading-book': ['SharpGrotesk-Book20'],
        'heading-serif': ['Montaga-Regular'],
        // Body text
        'body': ['Roboto-Regular'],
        'body-medium': ['Roboto-Medium'],
        'body-bold': ['Roboto-Bold'],
      },
      opacity: {
        '60': '.6',
      }
    },
  },
  plugins: [],
} 