/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        night: {
          950: "#0a0e17",
          900: "#0f1629",
          800: "#151d33",
          700: "#1c2742",
          600: "#243051",
        },
        sleep: {
          blue: "#3b82f6",
          indigo: "#6366f1",
          violet: "#8b5cf6",
          purple: "#a855f7",
        },
        glow: {
          cyan: "#22d3ee",
          blue: "#38bdf8",
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59, 130, 246, 0.4)",
        "glow-lg": "0 0 60px -15px rgba(99, 102, 241, 0.5)",
      },
    },
  },
  plugins: [],
};
