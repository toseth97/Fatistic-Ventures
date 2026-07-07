import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0EB",
        charcoal: "#1A1A1A",
        "soft-grey": "#6B7280",
        gold: {
          50: "#FFF9E6",
          100: "#FFF0B3",
          200: "#FFE680",
          300: "#FFDB4D",
          400: "#FFD119",
          500: "#E6B800",
          600: "#B38F00",
          700: "#806600",
          800: "#4D3D00",
          900: "#1A1400",
        },
        burgundy: {
          50: "#FDF2F4",
          100: "#F9D6DE",
          200: "#F2ADC1",
          300: "#E885A4",
          400: "#DF5C87",
          500: "#B83A64",
          600: "#932E50",
          700: "#6E223C",
          800: "#4A1628",
          900: "#260B14",
        },
        emerald: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.10)",
        "glass-lg": "0 12px 48px 0 rgba(31, 38, 135, 0.20)",
        glow: "0 0 20px rgba(230, 184, 0, 0.3)",
        "glow-burgundy": "0 0 20px rgba(184, 58, 100, 0.3)",
      },
      borderRadius: {
        glass: "16px",
        "glass-lg": "20px",
        "glass-sm": "12px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;