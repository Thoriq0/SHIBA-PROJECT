/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['src/dist/*.html'],
  darkMode: false,
  content: [
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'shiba': '#457EB8',
        'shibaA': '#DEA01E',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

