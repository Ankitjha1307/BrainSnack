import type { Config } from "tailwindcss";

/**
 * A real orange ramp. Previously every step 50-900 was the same hex, so any
 * "soft" usage (e.g. `bg-primary-100 text-primary-700`) rendered as solid
 * orange on solid orange. The hue is unchanged - only the value steps differ.
 */
const orange = {
  50: "#FFF4E6",
  100: "#FFE4C4",
  200: "#FFC98F",
  300: "#FFAB5A",
  400: "#FF8F2E",
  500: "#FF7A05",
  600: "#E56600",
  700: "#B85000",
  800: "#8A3B00",
  900: "#5C2700",
};

const config: Config = {
  // No dark theme ships. `class` is kept only so any stray `dark:` utility is
  // inert (nothing ever adds the `.dark` class).
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
        ring: "hsl(var(--ring))",
        muted: "hsl(var(--text-muted))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        main: "hsl(var(--main))",
        "main-foreground": "hsl(var(--main-foreground))",
        "secondary-background": "hsl(var(--secondary-background))",
        primary: orange,
        accent: orange,
      },
      // These three used to be nested *inside* `colors`, so `rounded-base`,
      // `shadow-shadow` and the press-translate utilities were never emitted.
      borderRadius: {
        base: "10px",
      },
      boxShadow: {
        shadow: "2px 2px 0 hsl(var(--border))",
        "shadow-sm": "1px 1px 0 hsl(var(--border))",
        "shadow-lg": "4px 4px 0 hsl(var(--border))",
      },
      spacing: {
        boxShadowX: "2px",
        boxShadowY: "2px",
        reverseBoxShadowX: "-2px",
        reverseBoxShadowY: "-2px",
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
