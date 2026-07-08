import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: '#1E3A8A', // Deep blue
            light: '#3B5BA5',
            dark: '#0F2B5E',
            deep: '#0A1A3A', // DeepSeek-like
          },
          purple: {
            DEFAULT: '#6B21A8', // Royal purple
            light: '#8B3FD9',
            dark: '#4A1B75',
            soft: '#9F7AEA',
          },
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c9d5ff',
          300: '#a7b9ff',
          400: '#7f93f5',
          500: '#5F6DE0',
          600: '#4A51C7',
          700: '#3D40A3',
          800: '#343780',
          900: '#2E3168',
          950: '#1B1E45',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A5',
          900: '#581C87',
          950: '#3B0764',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
    plugins: [
      require('@tailwindcss/typography'),
    ]
  
};

export default config;
