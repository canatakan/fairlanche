/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",'./node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#000",
      white: "#fff",
      gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827"
      },
      red: {
        100: "#fde8e8",
        200: "#fbd5d5",
        300: "#f8b4b4",
        400: "#f98080",
        500: "#f05252",
        600: "#e02424",
        700: "#c81e1e",
        800: "#9b1c1c",
        900: "#771d1d",
      },
      blue : {
        100: "#eff6ff",
        200: "#dbeafe",
        300: "#bfdbfe",
        400: "#93c5fd",
        500: "#60a5fa",
        600: "#3b82f6",
        700: "#2563eb",
        800: "#1d4ed8",
        900: "#1e40af",
      }
    },
    extend: {},
  },
  plugins: [require('tw-elements/dist/plugin')
  ],
}
