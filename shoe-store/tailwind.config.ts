import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef6ee",
          100: "#fdead7",
          200: "#fad2ae",
          300: "#f6b47a",
          400: "#f18b44",
          500: "#ec6a20",
          600: "#dd5116",
          700: "#b73d14",
          800: "#923218",
          900: "#762b16",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
