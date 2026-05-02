/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E53935',
          dark:    '#C62828',
          light:   '#EF9A9A',
        },
        navy: {
          DEFAULT: '#1E3A8A',
          dark:    '#1E2D5E',
          light:   '#3B5FBF',
        },
        gray: {
          light:  '#F3F4F6',
          medium: '#9CA3AF',
          dark:   '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
