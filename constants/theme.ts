export const Colors = {
  primary: {
    DEFAULT: '#FF5A5F', // Energetic Coral/Orange
    light: '#FF7E82',
    dark: '#E03E43',
  },
  secondary: {
    DEFAULT: '#00D1C4', // Electric Teal/Cyan
    light: '#33E0D6',
    dark: '#00A89E',
  },
  accent: {
    star: '#FFB800',    // Vivid Amber
    saved: '#FF5A5F',   // Coral
    danger: '#FF3366',  // Vivid Rose
  },
  markers: {
    user: '#00D1C4',      // Electric Teal
    historical: '#FFB800',// Vibrant Amber
    cultural: '#A855F7', // Electric Purple
    dining: '#FF5A5F',   // Coral
    events: '#10B981',   // Emerald
    default: '#FF5A5F',
  },
  background: {
    warm: '#F7F9FA',
    card: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.4)',
  },
} as const;

export type ColorScheme = typeof Colors;
