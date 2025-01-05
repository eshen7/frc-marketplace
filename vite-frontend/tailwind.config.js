import textShadow from 'tailwindcss-textshadow';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        paytone: ['Paytone One', 'sans-serif']
      },
      screens: {
        "525": "525px",
      }
    },
  },
  plugins: [
    textShadow
  ],
}

