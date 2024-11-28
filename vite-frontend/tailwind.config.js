/** @type {import('tailwindcss').Config} */
import textShadow from 'tailwindcss-textshadow'

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

