// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Matches the CSS variable set in layout.tsx
        display: ["var(--font-geist-mono)", "Avenir Next", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "IBM Plex Mono", "Consolas", "monospace"],
      },
      colors: {
        // Brand tokens — mirrors the original HTML CSS vars
        fleet: {
          bg0:      "#f4efe6",
          bg1:      "#fff9f0",
          ink0:     "#172029",
          ink1:     "#3a4b57",
          line:     "#d7ccba",
          critical: "#b42318",
          warning:  "#b54708",
          stable:   "#067647",
          chipBg:   "#fff4dd",
          card:     "#fffdf7",
          accent:   "#0f766e",
        },
      },
      keyframes: {
        rowIn: {
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
      },
      animation: {
        "row-in":        "rowIn 0.3s ease forwards",
        "slide-in-right":"slideInRight 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
