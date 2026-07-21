/** @type {import('tailwindcss').Config} */

// Semantic tokens map to CSS variables in src/index.css (HSL channels for opacity).
// All-in Daktechniek palette — derived from the existing logo (black + natural green):
// ink #161A17 · green #5C9A3C · warm off-white #FBFAF7.
const withVar = (name) => `hsl(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: withVar("--ink"),
          900: withVar("--ink-900"),
          800: withVar("--ink-800"),
          700: withVar("--ink-700"),
          600: withVar("--ink-600"),
        },
        green: {
          DEFAULT: withVar("--green"),
          strong: withVar("--green-strong"),
          soft: withVar("--green-soft"),
        },
        surface: withVar("--surface"),
        "surface-muted": withVar("--surface-muted"),
        "text-strong": withVar("--text-strong"),
        "text-body": withVar("--text-body"),
        "text-muted": withVar("--text-muted"),
        "text-invert": withVar("--text-invert"),
        line: withVar("--line"),
        "line-invert": withVar("--line-invert"),
        focus: withVar("--focus"),
        error: withVar("--error"),
        warning: withVar("--warning"),
        success: withVar("--green"),
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: { lg: "0.625rem", xl: "0.875rem", "2xl": "1.25rem" },
      boxShadow: {
        soft: "0 1px 2px rgb(22 26 23 / 0.06), 0 6px 20px rgb(22 26 23 / 0.08)",
        card: "0 1px 3px rgb(22 26 23 / 0.08), 0 10px 30px rgb(22 26 23 / 0.10)",
        lift: "0 20px 45px rgb(22 26 23 / 0.30)",
      },
      maxWidth: { content: "75rem", prose: "44rem" },
      transitionDuration: { DEFAULT: "200ms" },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
