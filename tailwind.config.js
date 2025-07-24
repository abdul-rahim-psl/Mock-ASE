/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // or 'class' if you want manual control
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors that work well in both light and dark modes
        'app-background': {
          light: '#ffffff',
          dark: '#121212'
        },
        'app-foreground': {
          light: '#171717',
          dark: '#f3f4f6'
        },
        'app-card': {
          light: '#ffffff',
          dark: '#1e1e1e'
        },
        'app-border': {
          light: '#e5e7eb',
          dark: '#2d2d2d'
        },
        'app-highlight': {
          light: '#f3f4f6',
          dark: '#333333'
        },
      },
    },
  },
  plugins: [],
};
