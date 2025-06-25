// tailwind.config.js
const { heroui } = require('@heroui/react');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/**/*.{js,ts,jsx,tsx}',
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'animate-spin',
    'border-current',
    'border-t-transparent',
    'rounded-full',
    {
      pattern: /col-span-(\d+)/,
      variants: ['sm', 'md', 'lg'],
    }
  ],
  theme: {
    extend: {
        animation: ['group-hover'],
        screens: {
          sm: '640px',
          'md960': '960px',
          'sm300': '300px',
          'sm600': '600px',
          'lg1200': '1200px',
          'lg1280': '1280px'
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui(), 
    require('tailwind-scrollbar-hide').default,
  ],
};