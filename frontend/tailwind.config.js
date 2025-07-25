module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
          black: '#171a20',
          gray: '#393c41',
          red: '#e82127',
          blue: '#3e6ae1',
          white: '#fff'
        }
      },
      fontFamily: {
        tesla: ['"Gotham SSm A"', '"Gotham SSm B"', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}; 