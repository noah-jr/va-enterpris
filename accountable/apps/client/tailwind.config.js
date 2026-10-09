import preset from '../../packages/config/tailwind/preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          850: '#151518',
        },
        darkblue: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#b9dbfe',
          300: '#7cbefd',
          400: '#369cf8',
          500: '#0c80eb',
          600: '#0264c8',
          700: '#034fa1',
          800: '#074384',
          900: '#0c3a6e',
          950: '#082549',
        },
        navy: {
          800: '#111c30',
          850: '#0d1627',
          900: '#090f1d',
          950: '#050a14',
        },
      },
    },
  },
  plugins: [],
};

