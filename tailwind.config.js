/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        black:   '#080808',
        void:    '#0c0c0c',
        surface: '#121212',
        card:    '#161616',
        border:  '#222222',
        border2: '#2e2e2e',
        red:     '#C1121F',
        off:     '#A3A3A3',
        muted:   '#666666',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        wider2: '0.14em',
        wider3: '0.18em',
        wider4: '0.2em',
      },
    },
  },
  plugins: [],
}
