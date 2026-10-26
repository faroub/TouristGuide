/**
 * Stitch Design System Tokens (stitch_vividscout_mobile_travel_guide)
 */
export const Colors = {
  // Brand Core Colors
  primary: {
    DEFAULT: '#FF5A5F', // Energetic Coral
    light: '#FF7E82',
    dark: '#E03E43',
  },
  secondary: {
    DEFAULT: '#00D1C4', // Electric Teal
    light: '#33E0D6',
    dark: '#00A89E',
  },
  background: {
    warm: '#F7F9FA',    // Warm Off-White
    card: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.4)',
  },
  // Stitch Category Theme Tokens
  themes: {
    sights: '#10B981',    // Neon Emerald
    dining: '#F59E0B',    // Fiery Amber
    history: '#8B5CF6',   // Vivid Purple
    events: '#FF5A5F',    // Energetic Coral
  },
  // Stitch Alert & Action State Tokens
  alerts: {
    offline: '#F97316',   // Sunset Orange
    error: '#EF4444',     // Crimson Red
    success: '#10B981',   // Neon Emerald
    star: '#F59E0B',      // Fiery Amber
  },
  // Map Markers Map
  markers: {
    user: '#00D1C4',      // Electric Teal
    historical: '#8B5CF6',// Vivid Purple
    cultural: '#8B5CF6',  // Vivid Purple
    dining: '#F59E0B',    // Fiery Amber
    events: '#FF5A5F',    // Energetic Coral
    sightseeing: '#10B981',// Neon Emerald
    default: '#FF5A5F',
  },
  // Border Radius Rule
  borderRadius: {
    fluid: 16, // 16px fluid rounded corners
  },
} as const;

export type ColorScheme = typeof Colors;
