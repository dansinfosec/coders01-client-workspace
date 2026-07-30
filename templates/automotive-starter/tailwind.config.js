/** @type {import('tailwindcss').Config} */

// Automotive starter — merk-neutraal, semantisch tokensysteem.
// Placeholder-palet "Graphite & Petrol" (pas kleuren aan in src/config/brand.ts):
//   dark   #16181D (basis-donker)   · secondary #5B6470   · paper #F5F3EF (licht)
//   primary#0C6E6A (diep teal)      · accent #F26B1D (spaarzaam) · kentekenplaat-signature
// Semantische tokens verwijzen naar CSS-variabelen; brand.ts (applyBrand) vult ze (HSL-kanalen → alpha werkt).
const withVar = (name) => `hsl(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: withVar("--asphalt"),
          900: withVar("--asphalt-900"),
          800: withVar("--asphalt-800"),
          700: withVar("--asphalt-700"),
          600: withVar("--asphalt-600"),
        },
        steel: {
          DEFAULT: withVar("--steel"),
          soft: withVar("--steel-soft"),
        },
        paper: withVar("--paper"),
        petrol: {
          DEFAULT: withVar("--petrol"),
          strong: withVar("--petrol-strong"),
          soft: withVar("--petrol-soft"),
        },
        torque: {
          DEFAULT: withVar("--torque"),
          strong: withVar("--torque-strong"),
        },
        // Kenteken-signature — uitsluitend binnen de plaatcomponent gebruiken.
        plate: {
          yellow: withVar("--plate-yellow"),
          blue: withVar("--plate-blue"),
          ink: withVar("--plate-ink"),
        },
        surface: {
          DEFAULT: withVar("--surface"),
          muted: withVar("--surface-muted"),
        },
        line: {
          DEFAULT: withVar("--line"),
          strong: withVar("--line-strong"),
          invert: withVar("--line-invert"),
        },
        "text-strong": withVar("--text-strong"),
        "text-body": withVar("--text-body"),
        "text-muted": withVar("--text-muted"),
        "text-invert": withVar("--text-invert"),
        focus: withVar("--focus"),
        error: withVar("--error"),
        success: withVar("--success"),
        // Statuslabels (occasions + leads).
        status: {
          available: withVar("--status-available"),
          reserved: withVar("--status-reserved"),
          sold: withVar("--status-sold"),
          new: withVar("--status-new"),
          soon: withVar("--status-soon"),
        },
      },
      fontFamily: {
        // Fonts komen uit config/brand.ts (applyBrand → CSS-variabelen). De @fontsource-
        // imports in src/index.css moeten matchen met de gekozen families.
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.06em" }],
      },
      letterSpacing: {
        tightish: "-0.01em",
        label: "0.08em",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "var(--brand-radius, 0.375rem)",
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(22 24 29 / 0.05), 0 8px 24px rgb(22 24 29 / 0.07)",
        card: "0 1px 3px rgb(22 24 29 / 0.08), 0 16px 36px rgb(22 24 29 / 0.10)",
        lift: "0 28px 60px rgb(22 24 29 / 0.30)",
        plate: "inset 0 0 0 2px rgb(22 24 29 / 0.85), 0 1px 2px rgb(22 24 29 / 0.25)",
      },
      maxWidth: {
        content: "80rem",
        prose: "42rem",
        wide: "90rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
