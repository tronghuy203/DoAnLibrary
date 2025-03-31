/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Chắc chắn rằng darkMode được bật
  theme: {
    extend: {
      backgroundImage: {
       
      },
      width:{
        "150":"500px"
      }

    },
  },
  plugins: [],
}

