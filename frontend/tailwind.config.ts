import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        "surface-muted": "hsl(var(--surface-muted))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--text-muted))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        main: "hsl(var(--main))",
        "main-foreground": "hsl(var(--main-foreground))",
        "secondary-background": "hsl(var(--secondary-background))",
        primary: {
          50: "#FF7A05",
          100: "#FF7A05",
          200: "#FF7A05",
          300: "#FF7A05",
          400: "#FF7A05",
          500: "#FF7A05",
          600: "#FF7A05",
          700: "#FF7A05",
          800: "#FF7A05",
          900: "#FF7A05",
        },
        borderRadius: {
          base: "5px",
        },
        boxShadow: {
          shadow:           "2px 2px 0 hsl(var(--border))",
        },
        spacing: {
          boxShadowX: "2px",
          boxShadowY: "2px",
          reverseBoxShadowX: "-2px",
          reverseBoxShadowY: "-2px",
        },
        accent: {
          50: "#FF7A05",
          100: "#FF7A05",
          200: "#FF7A05",
          300: "#FF7A05",
          400: "#FF7A05",
          500: "#FF7A05",
          600: "#FF7A05",
          700: "#FF7A05",
          800: "#FF7A05",
          900: "#FF7A05",
        },
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "Arial", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      animation: {
        "xp-pop": "xpPop 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        xpPop: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
