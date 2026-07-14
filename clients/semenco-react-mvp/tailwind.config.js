/** @type {import('tailwindcss').Config} */

// Semantic design tokens map to CSS custom properties defined in src/index.css.
// This keeps colours centralised and swappable once the Sem & Co logo and
// imagery have been analysed — no hard-coded hex values across components.
const withVar = (name) => `hsl(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: withVar("--color-background"),
        surface: withVar("--color-surface"),
        "surface-muted": withVar("--color-surface-muted"),
        "text-primary": withVar("--color-text-primary"),
        "text-secondary": withVar("--color-text-secondary"),
        brand: {
          DEFAULT: withVar("--color-brand"),
          soft: withVar("--color-brand-soft"),
          strong: withVar("--color-brand-strong"),
          secondary: withVar("--color-brand-secondary"),
          dark: withVar("--color-brand-dark"),
          light: withVar("--color-brand-light"),
        },
        accent: {
          DEFAULT: withVar("--color-accent"),
          soft: withVar("--color-accent-soft"),
        },
        border: withVar("--color-border"),
        focus: withVar("--color-focus"),
        success: withVar("--color-success"),
        warning: withVar("--color-warning"),
        error: withVar("--color-error"),
      },
      fontFamily: {
        // System UI stack for the scaffold; a brand typeface can be added later.
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        // Soft, home-like rounding.
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        // Restrained, soft shadows.
        soft: "0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px rgb(15 23 42 / 0.06)",
        card: "0 1px 3px rgb(15 23 42 / 0.05), 0 8px 24px rgb(15 23 42 / 0.05)",
      },
      maxWidth: {
        content: "72rem", // maximum readable content width
        prose: "42rem",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};
