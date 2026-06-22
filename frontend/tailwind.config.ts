import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        orbit: "4px 4px 0 rgba(30, 41, 59, 0.14)",
        chip: "3px 3px 0 rgba(30, 41, 59, 0.14)",
      },
      backgroundImage: {
        paper:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.85)), radial-gradient(circle at top left, rgba(219,234,254,0.85), transparent 45%), radial-gradient(circle at bottom right, rgba(254,240,138,0.45), transparent 38%)",
      },
      transitionProperty: {
        width: "width",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
