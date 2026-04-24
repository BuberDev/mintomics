import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef0ff",
          100: "#dde1ff",
          200: "#c0c7ff",
          300: "#99a0ff",
          400: "#726fff",
          500: "#6C63FF", // primary accent
          600: "#5a4fe8",
          700: "#4c3fcc",
          800: "#3e35a5",
          900: "#352f82",
        },
        dark: {
          900: "#0a0c1a",
          800: "#0f1124",
          700: "#161929",
          600: "#1e2235",
          500: "#252840",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
