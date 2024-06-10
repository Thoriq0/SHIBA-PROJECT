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
        'bluebutton': '#457EB8',
        'backgroundGreyMain': '#EBEBEB',
        'footerbg': '#DBF2FF',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

