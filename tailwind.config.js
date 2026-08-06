/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5D2E46',
          50: '#F5EEF2',
          100: '#E8D5DF',
          200: '#D1ABBF',
          300: '#BA81A0',
          400: '#A35780',
          500: '#8C2D60',
          600: '#5D2E46',
          700: '#4A2538',
          800: '#371C2A',
          900: '#24131C',
        },
        accent: {
          DEFAULT: '#B5838D',
          light: '#D4ACB5',
          dark: '#96656D',
        },
        surface: {
          DEFAULT: '#FAF7F5',
          muted: '#F0EBE6',
        },
        ink: {
          DEFAULT: '#1C1418',
          muted: '#6B5E66',
        },
        border: '#E5DCD6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 40px -20px rgba(93, 46, 70, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s ease-out both',
        'fade-in': 'fade-in 0.35s ease-out both',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(181,131,141,0.25), transparent), radial-gradient(ellipse 60% 50% at 90% 10%, rgba(93,46,70,0.12), transparent), linear-gradient(180deg, #FAF7F5 0%, #F0EBE6 100%)',
      },
    },
  },
  plugins: [],
};
