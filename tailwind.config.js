/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette de l'app mobile « Afro-Tech » : or + nuit
        taara: {
          50: '#fff8eb',
          100: '#ffecc7',
          500: '#f5a623',
          600: '#f09410',
          700: '#d97a06',
          900: '#080c18',
        },
        night: {
          900: '#080c18',
          800: '#0f1424',
          700: '#171b28',
          600: '#1f2436',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
