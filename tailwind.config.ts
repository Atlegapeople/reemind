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
        primary: {
          light: "#227C9D",
          dark: "#17C3B2",
        },
        background: {
          light: "#f7f7f8",
          dark: "#111827",
        },
        card: {
          light: "rgba(255, 255, 255, 0.95)",
          dark: "rgba(17, 24, 39, 0.95)",
        },
        text: {
          light: "#334155",
          dark: "#F1F5F9",
        },
        input: {
          light: "#FFFFFF",
          dark: "#1F2937",
        },
        border: {
          light: "#E2E8F0",
          dark: "#374151",
        },
      },
    },
  },
  plugins: [],
};

export default config; 