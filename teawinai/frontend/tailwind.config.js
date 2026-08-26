/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fff6e8',
          500: '#FBAE42',
          600: '#A8223B',
          700: '#8f1d32',
        }
      }
    },
  },
  plugins: [],
}
