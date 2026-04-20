/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C49145',
        'gold-light': '#D4A574',
        dark: '#1a1a1a',
        surface: '#f5f5f5',
        cream: '#fffbf7',
        'warm-gray': '#8b8b8b',
        border: '#e5e5e5',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
