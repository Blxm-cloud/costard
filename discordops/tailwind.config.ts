import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Discord brand purple
        blurple: {
          DEFAULT: "#5865F2",
          dark: "#4752C4",
          light: "#707BF4",
        },
        // Validation / success accent
        emerald: {
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        danger: {
          DEFAULT: "#EF4444",
          dark: "#B91C1C",
        },
        // Cyberpunk dark surfaces
        ink: {
          950: "#050507",
          900: "#0B0B10",
          800: "#121218",
          700: "#1A1A22",
          600: "#26262F",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(88, 101, 242, 0.35)",
        "glow-emerald": "0 0 24px rgba(16, 185, 129, 0.35)",
        "glow-danger": "0 0 24px rgba(239, 68, 68, 0.35)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 6s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
