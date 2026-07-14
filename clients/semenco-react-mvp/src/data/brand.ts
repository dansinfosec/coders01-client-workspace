/**
 * Sem & Co brand reference — the single source of truth for logo paths and the
 * verified colour palette. The actual runtime colours live as CSS custom
 * properties in `src/index.css` (as HSL channels, for Tailwind opacity support);
 * this file documents the hex values, their origin, and any accessibility
 * adjustments. See `scraped-data/reports/brand-analysis.md` for full evidence.
 *
 * Colours were verified from TWO sources that agree:
 *   1. The official logo: public/images/semenco/brand/semenco-logo.png
 *   2. The live theme CSS on semenco.nl (WordPress/Divi).
 */

export const brandLogo = {
  /** Primary full-colour logo (tree icon + "Sem & Co" wordmark, transparent PNG). */
  src: "/images/semenco/brand/semenco-logo.png",
  alt: "Sem & Co",
  width: 400,
  height: 286,
  format: "png",
  transparent: true,
  /** Content fills the whole canvas (0 margins) — no trimming needed. */
  tightlyCropped: true,
  /** No separate light/dark variants exist; the logo is designed for light backgrounds. */
  variants: "single-full-colour",
  sourceUrl: "https://semenco.nl/wp-content/uploads/2025/12/Sem-Co-logo.png",
} as const;

export interface BrandColour {
  /** Semantic token name (matches the CSS custom property). */
  token: string;
  hex: string;
  /** Where this colour was found. */
  origin: string;
  /** Contrast ratio vs white (#fff), for reference. */
  contrastOnWhite: number;
  note?: string;
}

/** Verified brand colours (as found), before any accessibility adjustment. */
export const brandColours: BrandColour[] = [
  {
    token: "--brand-primary",
    hex: "#72744e",
    origin: 'Logo "Sem" + tree outline; live CSS button/CTA/heading colour.',
    contrastOnWhite: 4.86,
    note: "Primary. Passes AA for normal text and for white text on it.",
  },
  {
    token: "--brand-secondary",
    hex: "#896b4c",
    origin: "Logo tree trunk; live CSS header & menu background.",
    contrastOnWhite: 4.92,
    note: "Warm brown. Passes AA; used for warm accents (see --color-accent adjustment).",
  },
  {
    token: "--brand-dark",
    hex: "#172c30",
    origin: 'Logo "& Co"; live CSS footer background + active nav colour.',
    contrastOnWhite: 14.59,
    note: "Navy. Excellent contrast; basis for text-primary and dark surfaces.",
  },
  {
    token: "--brand-accent (source)",
    hex: "#82c0c7",
    origin: "Live CSS widget link-hover colour.",
    contrastOnWhite: 2.04,
    note: "Soft teal. FAILS text contrast — decorative only; darkened for any text use.",
  },
  {
    token: "--brand-light",
    hex: "#fafae1",
    origin: "Live CSS light gradient background (with #67a671).",
    contrastOnWhite: 1.06,
    note: "Cream. Background only.",
  },
];

/** Accessibility-adjusted variants (same brand character, WCAG-AA safe). */
export const accessibleVariants: BrandColour[] = [
  {
    token: "--brand-primary-hover",
    hex: "#545735",
    origin: "Darkened --brand-primary for hover/active states.",
    contrastOnWhite: 6.82,
  },
  {
    token: "--brand-accent (implemented)",
    hex: "#2c6c73",
    origin: "Darkened teal from #82c0c7 so it is usable for text/icons.",
    contrastOnWhite: 5.74,
  },
  {
    token: "--color-accent (component warm accent)",
    hex: "#795f3f",
    origin: "Slightly darkened --brand-secondary for small label text on tinted fills.",
    contrastOnWhite: 5.9,
  },
  {
    token: "--text-primary",
    hex: "#1f3034",
    origin: "Navy-derived body-text colour.",
    contrastOnWhite: 13.9,
  },
];
