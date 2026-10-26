/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Stitch Canvas Core Brand Colors
        coral: {
          DEFAULT: '#FF5A5F', // Primary: Energetic Coral
          light: '#FF7E82',
          dark: '#E03E43',
        },
        teal: {
          DEFAULT: '#00D1C4', // Secondary: Electric Teal
          light: '#33E0D6',
          dark: '#00A89E',
        },
        offwhite: {
          DEFAULT: '#F7F9FA', // Background: Warm Off-White
        },
        // Stitch Category Theme Colors
        emerald: {
          DEFAULT: '#10B981', // Sights / Landmarks Theme: Neon Emerald
        },
        amber: {
          DEFAULT: '#F59E0B', // Restaurants / Dining Theme: Fiery Amber
        },
        purple: {
          DEFAULT: '#8B5CF6', // History / Culture Theme: Vivid Purple
        },
        // Stitch Alert & Action State Colors
        sunset: {
          DEFAULT: '#F97316', // Alert State (Offline): Sunset Orange
        },
        crimson: {
          DEFAULT: '#EF4444', // Action State (Error): Crimson Red
        },
      },
      borderRadius: {
        fluid: '16px', // Stitch Border Radius Rule: 16px
      },
    },
  },
  plugins: [],
};
