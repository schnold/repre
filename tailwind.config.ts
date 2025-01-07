// FILE: tailwind.config.ts
import type { Config } from "tailwindcss"
import animatePlugin from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These let you do `bg-background` or `text-foreground`.
        background: "rgb(243, 247, 251)",   // or your chosen color
        foreground: "rgb(27, 31, 36)",      // or your chosen color
        // You can define more custom colors if you want:
        brand: {
          50: "#eef6ff",
          100: "#dceeff",
          200: "#b6deff",
          300: "#8ccafd",
          400: "#5ab2fa",
          500: "#2e9df7",
          600: "#1e7edb",
          700: "#1866b1",
          800: "#124e82",
          900: "#0b3354",
        },
        accent: {
          50: "#fffbf2",
          100: "#fef3d3",
          200: "#fde5a6",
          300: "#fcd878",
          400: "#fbc84a",
          500: "#fab61e",
          600: "#dd9d15",
          700: "#aa7911",
          800: "#77560c",
          900: "#443107",
        },
        // Another example: you can define "muted-foreground" or "muted" if you want
        "muted-foreground": "#6b7280",
        "muted": "#f5f5f5",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
