/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1s ease-in-out',
      },
      colors: {
        white: '#ffffffb',
        access: '#828282',
        alltheme: '#512da8',
      },
      screens: {
        xs: { max: '600px' },
        sm: '601px',
        md: '800px',
        lg: '1200px',
        xl: '1400px',
        '2xl': '1600px',
      },
    },
  },

  plugins: [],
}
