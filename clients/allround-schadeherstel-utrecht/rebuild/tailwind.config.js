/** @type {import('tailwindcss').Config} */

// Semantic tokens map to CSS variables in src/index.css (HSL channels so Tailwind
// can apply opacity via hsl(var(--x) / <alpha-value>)).
//
// MEASURED from the supplied logo artwork (sampled pixels):
//   background  #242424  (neutral anthracite)
//   accent      #C65000  (warm orange stripe)  -> hsl(24 100% 39%)
// Supporting neutrals (surface ramp, steel-grey, muted text, hairline) added for
// accessibility and UI structure.
const withVar = (name) => `hsl(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        anthracite: withVar("--anthracite"), // measured #242424
        surface: {
          DEFAULT: withVar("--surface"),
          muted: withVar("--surface-muted"),
          raised: withVar("--surface-raised"),
        },
        ink: withVar("--ink"), // near-black, used for text on orange
        white: withVar("--white"),
        orange: {
          DEFAULT: withVar("--orange"), // measured #C65000
          bright: withVar("--orange-bright"),
        },
        steel: withVar("--steel"),
        "text-strong": withVar("--text-strong"),
        "text-body": withVar("--text-body"),
        "text-muted": withVar("--text-muted"),
        "text-invert": withVar("--text-invert"),
        line: withVar("--line"),
        focus: withVar("--focus"),
        success: withVar("--success"),
        error: withVar("--error"),
      },
      fontFamily: {
        sans: [
          "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica",
          "Arial", "sans-serif",
        ],
      },
      borderRadius: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem" },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.45), 0 10px 30px rgb(0 0 0 / 0.35)",
        lift: "0 28px 60px rgb(0 0 0 / 0.55)",
      },
      maxWidth: { content: "78rem", prose: "44rem" },
      letterSpacing: { widest: "0.2em" },
      transitionDuration: { DEFAULT: "200ms" },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up 0.6s ease-out both" },
    },
  },
  plugins: [],
};
