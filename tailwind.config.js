/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        taara: {
          50: '#f5f7ff',
          100: '#e8edff',
          500: '#5b6bff',
          600: '#4651e8',
          700: '#3640bf',
          900: '#080c18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
