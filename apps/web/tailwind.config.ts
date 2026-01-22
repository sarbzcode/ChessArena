import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      colors: {
        ink: "#0f1417",
        parchment: "#f3efe6",
        moss: "#2d6a4f",
        ember: "#e76f51",
        slate: "#5c677d"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 20, 23, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config;
