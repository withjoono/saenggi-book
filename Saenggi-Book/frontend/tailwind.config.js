/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('geobuk-shared/tailwind-preset')],
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../node_modules/geobuk-shared/dist/**/*.js",
    "../../node_modules/geobuk-shared/dist/**/*.js",
  ],
  prefix: "",
  theme: {},
  plugins: [],
};
