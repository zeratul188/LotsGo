// tailwind.config.js
const { heroui } = require('@heroui/react');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'animate-spin',
    'border-current',
    'border-t-transparent',
    'rounded-full',
  ],
  theme: {
    extend: {
        animation: ['group-hover'],
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
};