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
    },
  },
  plugins: [
    require('tailwindcss-textshadow') // Requires a plugin for text shadows
  ],
}

