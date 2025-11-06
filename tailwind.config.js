/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          bgDark: "#0b1420",
          bgCard: "#171e2e",
          textMain: "#d7d9e0",
          textMuted: "#8a8f9c",
          primary: "#5865f2",
        },
      },
    },
    plugins: [],
  };
  