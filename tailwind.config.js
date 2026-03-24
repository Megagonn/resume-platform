/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
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
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}