/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['src/dist/*.html'],
  darkMode: false,
  content: [
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

