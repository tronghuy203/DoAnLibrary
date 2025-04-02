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
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out",
        "slide-up": "slideUp 1s ease-out",
        "pulse-slow": "pulseSlow 4s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

