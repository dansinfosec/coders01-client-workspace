/** @type {import('tailwindcss').Config} */

// Semantic tokens map to CSS variables in src/index.css (HSL channels for opacity).
// Roofing Center palette: navy #0D222D · green #45D38E · cream #FEE7AD.
const withVar = (name) => `hsl(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: withVar("--navy"),
          900: withVar("--navy-900"),
          800: withVar("--navy-800"),
          700: withVar("--navy-700"),
          600: withVar("--navy-600"),
        },
        green: {
          DEFAULT: withVar("--green"),
          strong: withVar("--green-strong"),
          soft: withVar("--green-soft"),
        },
        cream: {
          DEFAULT: withVar("--cream"),
          soft: withVar("--cream-soft"),
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
        soft: "0 1px 2px rgb(13 34 45 / 0.06), 0 6px 20px rgb(13 34 45 / 0.08)",
        card: "0 1px 3px rgb(13 34 45 / 0.08), 0 10px 30px rgb(13 34 45 / 0.10)",
        lift: "0 20px 45px rgb(13 34 45 / 0.28)",
      },
      maxWidth: { content: "75rem", prose: "44rem" },
      transitionDuration: { DEFAULT: "200ms" },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "slide-in-right": "slide-in-right 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
