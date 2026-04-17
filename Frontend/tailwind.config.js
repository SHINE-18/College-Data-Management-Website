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
                    DEFAULT: '#1e3a5f',
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#627d98',
                    500: '#3e6b9a',
                    600: '#2d5a87',
                    700: '#1e3a5f',
                    800: '#163050',
                    900: '#102a43',
                },
                accent: {
                    DEFAULT: '#d97706',
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#d97706',
                    600: '#b45309',
                    700: '#92400e',
                    800: '#78350f',
                    900: '#451a03',
                },
                cream: {
                    DEFAULT: '#f0ece4',
                    50: '#faf9f7',
                    100: '#f5f3ef',
                    200: '#f0ece4',
                    300: '#e5ddd0',
                    400: '#d4c8b5',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
