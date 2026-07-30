/** @type {import('tailwindcss').Config} */

// Semantic tokens map to CSS variables in src/index.css (HSL channels for opacity).
// BM Carservice palette — workshop-signage identity:
//   ink #15171C (werkplaats-antraciet) · signal #FFD100 (bewegwijzering, spaarzaam)
//   mark #D81E05 (BM-rood: alleen merk + hoofd-CTA) · concrete #F4F3EF · pass #1E7A46 (keuring).
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
        signal: {
          DEFAULT: withVar("--signal"),
          strong: withVar("--signal-strong"),
          soft: withVar("--signal-soft"),
        },
        mark: {
          DEFAULT: withVar("--mark"),
          strong: withVar("--mark-strong"),
        },
        pass: withVar("--pass"),
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
      },
      fontFamily: {
        // Body
        sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        // Signage display headings
        display: ['"Archivo"', "system-ui", "Segoe UI", "Arial", "sans-serif"],
        // Labels, tags, data (reception-board / inspection readout)
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: { signage: "0.02em" },
      borderRadius: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem" },
      boxShadow: {
        soft: "0 1px 2px rgb(21 23 28 / 0.06), 0 6px 20px rgb(21 23 28 / 0.08)",
        card: "0 1px 3px rgb(21 23 28 / 0.08), 0 12px 30px rgb(21 23 28 / 0.12)",
        lift: "0 24px 50px rgb(21 23 28 / 0.35)",
      },
      maxWidth: { content: "76rem", prose: "44rem" },
      transitionDuration: { DEFAULT: "200ms" },
      backgroundImage: {
        // Signature: diagonal safety-stripe (hazard) band — signal on ink.
        hazard:
          "repeating-linear-gradient(-45deg, hsl(var(--signal)) 0 18px, hsl(var(--ink)) 18px 36px)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
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
