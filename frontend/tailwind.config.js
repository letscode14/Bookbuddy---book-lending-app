/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"], // Replace 'Roboto' with your preferred font family
      },
      colors: {
        white: "#ffffffb",
        access: "#828282",
        alltheme: "#512da8",
      },
    },
  },

  plugins: [],
};
