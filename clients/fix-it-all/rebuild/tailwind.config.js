/** @type {import('tailwindcss').Config} */

// Fix-it All — eigen visuele identiteit (bewust géén BM Carservice-look).
// Karakter: technisch · krachtig · lokaal · betrouwbaar · modern.
// Palet "Graphite & Petrol":
//   asphalt #16181D (basis-donker, showroom/werkplaats)  · steel #5B6470 (secundair)
//   paper   #F5F3EF (licht)                               · petrol #0C6E6A (merk-accent, diep teal)
//   torque  #F26B1D (functionele energie, spaarzaam)      · kenteken-geel/NL-blauw (alléén in de plaat)
// Semantische tokens verwijzen naar CSS-variabelen in src/index.css (HSL-kanalen → alpha werkt).
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
        // Display — karaktervolle grotesk (koppen). Bewust ánders dan BM's Archivo.
        display: ['"Bricolage Grotesque Variable"', "system-ui", "Segoe UI", "Arial", "sans-serif"],
        // Body — neutraal, technisch-helder, uitstekend leesbaar.
        sans: ['"Inter Variable"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        // Data/labels — specs, openingstijden, kenteken, tags (technische "readout").
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
        DEFAULT: "0.375rem",
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
