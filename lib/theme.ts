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

export const fontSize = {
  'display-large': ['40px', { lineHeight: '48px' }],
  'display-medium': ['36px', { lineHeight: '44px' }],
  'display-small': ['32px', { lineHeight: '40px' }],
  'heading-large': ['24px', { lineHeight: '32px' }],
  'heading-medium': ['20px', { lineHeight: '28px' }],
  'heading-small': ['18px', { lineHeight: '24px' }],
  'body-large': ['17px', { lineHeight: '24px' }],
  'body-medium': ['15px', { lineHeight: '22px' }],
  'body-small': ['13px', { lineHeight: '20px' }],
} as const; 