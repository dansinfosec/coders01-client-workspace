/** @type {import('tailwindcss').Config} */

// Semantic tokens map to CSS variables in src/index.css (HSL channels for opacity).
// Gentleman's Touch palette — MEASURED from the Setmore logo artwork:
//   black #000000 · warm cream #EEE2C2 · deep red #A31E1F.
// Supporting neutrals (charcoal surfaces, muted text) added for accessibility.
const withVar = (name) => `hsl(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: withVar("--ink"), // measured black #000000
          900: withVar("--ink-900"),
          800: withVar("--ink-800"),
          700: withVar("--ink-700"),
          600: withVar("--ink-600"),
        },
        cream: {
          DEFAULT: withVar("--cream"), // measured #EEE2C2
          strong: withVar("--cream-strong"),
          soft: withVar("--cream-soft"),
        },
        red: {
          DEFAULT: withVar("--red"), // measured #A31E1F
          bright: withVar("--red-bright"),
        },
        surface: withVar("--surface"),
        "surface-muted": withVar("--surface-muted"),
        "text-strong": withVar("--text-strong"),
        "text-body": withVar("--text-body"),
        "text-muted": withVar("--text-muted"),
        "text-invert": withVar("--text-invert"),
        line: withVar("--line"),
        focus: withVar("--focus"),
      },
      fontFamily: {
        serif: ["Georgia", "'Times New Roman'", "serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem" },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px rgb(0 0 0 / 0.35)",
        lift: "0 24px 50px rgb(0 0 0 / 0.55)",
      },
      maxWidth: { content: "75rem", prose: "42rem" },
      letterSpacing: { widest: "0.18em" },
      transitionDuration: { DEFAULT: "200ms" },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-up": "fade-up 0.6s ease-out both" },
    },
  },
  plugins: [],
};
