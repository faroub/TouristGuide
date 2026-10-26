/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
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
        background: {
          warm: '#F7F9FA',  // Warm Off-white
          card: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
