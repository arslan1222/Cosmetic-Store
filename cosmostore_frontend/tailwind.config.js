/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F1",
        ink: "#241521",
        berry: {
          50: "#FBEAEE",
          100: "#F3DCD4",
          200: "#E3AFAF",
          400: "#C24F6C",
          500: "#A6314F",
          600: "#8A2540",
          700: "#6E1D33",
        },
        gold: {
          400: "#D2AE5C",
          500: "#B8923D",
          600: "#96772F",
        },
        blush: "#F3DCD4",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(36, 21, 33, 0.25)",
      },
    },
  },
  plugins: [],
};
