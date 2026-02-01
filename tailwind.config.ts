import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1a1a1a",
        surface: "#2d2d2d",
        primary: "#3b82f6",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        text: "#f5f5f5",
        "text-secondary": "#a3a3a3",
      },
    },
  },
  plugins: [],
};
export default config;
