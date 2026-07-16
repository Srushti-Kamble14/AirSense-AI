/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        void: {
          950: "#050810",
          900: "#0a0f1a",
          800: "#0f1624",
          700: "#161f31",
        },
        aurora: {
          cyan: "#4dd8e6",
          violet: "#9b7bff",
          teal: "#2be3b0",
        },
        aqi: {
          good: "#2be3b0",
          moderate: "#e8d24c",
          sensitive: "#f0a942",
          unhealthy: "#f2634e",
          severe: "#c23bd8",
          hazardous: "#7c1f3a",
        },
        border: "hsl(217 33% 22%)",
        input: "hsl(217 33% 22%)",
        ring: "hsl(190 80% 60%)",
        background: "hsl(224 47% 6%)",
        foreground: "hsl(210 40% 96%)",
        card: "hsl(222 45% 9%)",
        primary: {
          DEFAULT: "#4dd8e6",
          foreground: "#04141a",
        },
        secondary: {
          DEFAULT: "#161f31",
          foreground: "#dfe8f5",
        },
        muted: {
          DEFAULT: "#101828",
          foreground: "#8b9bb4",
        },
        accent: {
          DEFAULT: "#9b7bff",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.08)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        twinkle: {
          "0%, 100%": { opacity: 0.2 },
          "50%": { opacity: 1 },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        breathe: "breathe 3.2s ease-in-out infinite",
        twinkle: "twinkle 2.6s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "spin-slow": "spin-slow 60s linear infinite",
        "spin-slower": "spin-slow 180s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
