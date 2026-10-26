export const Colors = {
  primary: {
    DEFAULT: '#2563eb', // Blue 600
    light: '#dbeafe',   // Blue 100
    dark: '#1d4ed8',    // Blue 700
  },
  secondary: {
    DEFAULT: '#0f172a', // Slate 900
    muted: '#64748b',   // Slate 500
  },
  accent: {
    star: '#d97706',    // Amber 600
    saved: '#2563eb',   // Blue 600
    danger: '#e11d48',  // Rose 600
  },
  markers: {
    user: '#2563eb',      // Primary user location marker
    historical: '#d97706',// Amber marker
    cultural: '#7c3aed', // Purple marker
    dining: '#e11d48',   // Rose marker
    events: '#059669',   // Emerald marker
    default: '#2563eb',
  },
  background: {
    light: '#f8fafc',
    card: '#ffffff',
    overlay: 'rgba(15, 23, 42, 0.4)',
  },
} as const;

export type ColorScheme = typeof Colors;
