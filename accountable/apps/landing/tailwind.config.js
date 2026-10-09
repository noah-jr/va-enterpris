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
        brand: {
          50: '#eef4ff',
          100: '#dfeaff',
          200: '#b8d1ff',
          300: '#8ab0ff',
          400: '#5686ff',
          500: '#3b6bfa',
          600: '#2650e0',
          700: '#1e3fb3',
          850: '#16296e',
          900: '#132355',
          950: '#0b1636',
        },
        slate: {
          850: '#212b46',
          900: '#182136',
          950: '#0f1524',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.4s ease-out',
        'marquee': 'marquee 28s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
    boxShadow: { sm: 'none', DEFAULT: 'none', md: 'none', lg: 'none', xl: 'none', '2xl': 'none', inner: 'none', none: 'none' },
    borderRadius: { none: '0px', sm: '5px', DEFAULT: '5px', md: '5px', lg: '5px', xl: '5px', '2xl': '5px', '3xl': '5px', full: '9999px' },
    borderWidth: { DEFAULT: '0px', 0: '0px', 2: '0px', 4: '0px', 8: '0px' },
    divideWidth: { DEFAULT: '0px', 0: '0px', 2: '0px', 4: '0px', 8: '0px' },
    ringWidth: { DEFAULT: '0px', 0: '0px', 1: '0px', 2: '0px', 4: '0px', 8: '0px' },
  },
  plugins: [],
};
