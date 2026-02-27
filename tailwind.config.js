/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1a3c5e',
                    50: '#eef4fa',
                    100: '#d5e3f0',
                    200: '#aac7e1',
                    300: '#80abd2',
                    400: '#558fc3',
                    500: '#2b73b4',
                    600: '#225c90',
                    700: '#1a456c',
                    800: '#1a3c5e',
                    900: '#0d1e2f',
                },
                accent: {
                    DEFAULT: '#2980b9',
                    50: '#eaf4fb',
                    100: '#c8e2f5',
                    200: '#91c5eb',
                    300: '#5aa8e1',
                    400: '#2980b9',
                    500: '#21679a',
                    600: '#1a4e7a',
                    700: '#13365a',
                    800: '#0c1e3a',
                    900: '#06101d',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
