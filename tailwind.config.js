/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      primary: '#c7a4ee',
      secondary: '#96DD48',
      lightgray: '#CCCCCC',
      gray: '#707070',
      white: '#FFFFFF',
      black: '#000000',
    },
    extend: {
      animation: {
        'jump': 'jump 0.5s ease-in-out'
      },
      keyframes: {
        jump: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' }, // Moves up
          '100%': { transform: 'translateY(0)' }, // Returns to original position
        },
      },
    },
  },
  plugins: [],
}
