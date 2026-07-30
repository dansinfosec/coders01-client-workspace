/**
 * Branding — de ENIGE plek om de visuele identiteit van een klant te wijzigen.
 *
 * Kleuren staan als HSL-kanalen ("H S% L%") zodat Tailwind's `<alpha-value>` blijft
 * werken (bijv. `bg-primary/20`). De semantische Tailwind-tokens (primary, accent,
 * surface, text-*, …) verwijzen via `tailwind.config.js` naar CSS-variabelen; hier
 * bepalen we de wáárden. `applyBrand()` (aangeroepen in `main.tsx`) schrijft ze naar
 * `:root`, zodat één bestand het hele thema stuurt.
 *
 * `src/index.css` bevat dezelfde waarden als no-JS fallback — houd ze gelijk als je
 * een flits bij eerste paint wilt vermijden, of laat index.css met rust en beheer
 * kleuren uitsluitend hier.
 */

/** HSL-kanalen zonder `hsl()`-wrapper, bijv. "178 80% 24%". */
type Hsl = string;

export interface BrandTokens {
  // --- Merkkleuren (pas deze als eerste aan per klant) ---
  /** Primair — koppen-accent, links, knoppen. */
  primary: Hsl;
  primaryStrong: Hsl;
  primarySoft: Hsl;
  /** Accent — spaarzame energie/CTA-highlight. */
  accent: Hsl;
  accentStrong: Hsl;
  /** Secundair — neutrale steun-/labelkleur. */
  secondary: Hsl;
  secondarySoft: Hsl;
  /** Donker basisvlak (footer/hero). */
  dark: Hsl;
  dark900: Hsl;
  dark800: Hsl;
  dark700: Hsl;
  dark600: Hsl;

  // --- Achtergronden ---
  paper: Hsl;
  surface: Hsl;
  surfaceMuted: Hsl;

  // --- Lijnen ---
  line: Hsl;
  lineStrong: Hsl;
  lineInvert: Hsl;

  // --- Tekst ---
  textStrong: Hsl;
  textBody: Hsl;
  textMuted: Hsl;
  textInvert: Hsl;

  // --- Functioneel ---
  focus: Hsl;
  error: Hsl;
  success: Hsl;

  // --- Statuslabels (occasions/leads) ---
  statusAvailable: Hsl;
  statusReserved: Hsl;
  statusSold: Hsl;
  statusNew: Hsl;
  statusSoon: Hsl;

  // --- Signature: Nederlandse kentekenplaat (alleen in KentekenPlate) ---
  plateYellow: Hsl;
  plateBlue: Hsl;
  plateInk: Hsl;
}

export interface Brand {
  /** Neutrale, herkenbare placeholder-identiteit. Vervang per klant. */
  tokens: BrandTokens;
  /** Border-radius basis (px/rem-string). Tailwind `rounded` erft hiervan in index.css. */
  radius: string;
  /** Logo — tekstwordmark óf afbeelding. */
  logo: {
    /** Hoofdwoord van de wordmark (getoond als er geen `imageSrc` is). */
    text: string;
    /** Optioneel geaccentueerd blokje achter de wordmark (bijv. een korte suffix). */
    badge: string | null;
    /** Zet op een pad in /public om een echt logo te tonen i.p.v. de tekstwordmark. */
    imageSrc: string | null;
    /** Variant voor donkere achtergrond (header/footer). */
    imageSrcInvert: string | null;
  };
  /** Favicon-pad in /public (ook in index.html verwijzen). */
  favicon: string;
  /** Font-families (moeten als @fontsource-pakket geïmporteerd zijn in index.css). */
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
}

/**
 * PLACEHOLDER-thema "Graphite & Petrol" — een nette, merk-neutrale automotive-look.
 * Vervang de kleuren hieronder door de merkkleuren van de klant.
 */
export const brand: Brand = {
  tokens: {
    primary: "178 80% 24%",
    primaryStrong: "178 84% 17%",
    primarySoft: "178 40% 90%",
    accent: "22 89% 53%",
    accentStrong: "20 90% 46%",
    secondary: "214 10% 40%",
    secondarySoft: "214 12% 62%",
    dark: "222 14% 10%",
    dark900: "222 17% 8%",
    dark800: "222 13% 13%",
    dark700: "220 12% 18%",
    dark600: "220 11% 25%",

    paper: "40 24% 95%",
    surface: "40 20% 98%",
    surfaceMuted: "40 16% 93%",

    line: "220 14% 87%",
    lineStrong: "220 12% 78%",
    lineInvert: "220 10% 26%",

    textStrong: "222 18% 13%",
    textBody: "220 12% 27%",
    textMuted: "214 10% 44%",
    textInvert: "40 24% 96%",

    focus: "178 70% 38%",
    error: "0 66% 46%",
    success: "152 55% 36%",

    statusAvailable: "152 55% 36%",
    statusReserved: "38 78% 42%",
    statusSold: "0 52% 42%",
    statusNew: "22 89% 53%",
    statusSoon: "214 14% 46%",

    plateYellow: "51 93% 53%",
    plateBlue: "231 65% 30%",
    plateInk: "222 20% 8%",
  },
  radius: "0.375rem",
  logo: {
    text: "AUTOBEDRIJF",
    badge: "DEMO",
    imageSrc: null,
    imageSrcInvert: null,
  },
  favicon: "/favicon.svg",
  fonts: {
    display: '"Bricolage Grotesque Variable", system-ui, "Segoe UI", Arial, sans-serif',
    body: '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    mono: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
};

/** Mapt BrandTokens-sleutels → CSS-variabelenamen uit index.css / tailwind.config.js. */
const CSS_VAR: Record<keyof BrandTokens, string> = {
  primary: "--petrol",
  primaryStrong: "--petrol-strong",
  primarySoft: "--petrol-soft",
  accent: "--torque",
  accentStrong: "--torque-strong",
  secondary: "--steel",
  secondarySoft: "--steel-soft",
  dark: "--asphalt",
  dark900: "--asphalt-900",
  dark800: "--asphalt-800",
  dark700: "--asphalt-700",
  dark600: "--asphalt-600",
  paper: "--paper",
  surface: "--surface",
  surfaceMuted: "--surface-muted",
  line: "--line",
  lineStrong: "--line-strong",
  lineInvert: "--line-invert",
  textStrong: "--text-strong",
  textBody: "--text-body",
  textMuted: "--text-muted",
  textInvert: "--text-invert",
  focus: "--focus",
  error: "--error",
  success: "--success",
  statusAvailable: "--status-available",
  statusReserved: "--status-reserved",
  statusSold: "--status-sold",
  statusNew: "--status-new",
  statusSoon: "--status-soon",
  plateYellow: "--plate-yellow",
  plateBlue: "--plate-blue",
  plateInk: "--plate-ink",
};

/**
 * Schrijft de brand-tokens naar `document.documentElement` als CSS-variabelen.
 * Aanroepen vóór het renderen (zie main.tsx). Veilig no-op buiten de browser.
 */
export function applyBrand(b: Brand = brand): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  (Object.keys(b.tokens) as Array<keyof BrandTokens>).forEach((key) => {
    root.style.setProperty(CSS_VAR[key], b.tokens[key]);
  });
  root.style.setProperty("--brand-radius", b.radius);
  root.style.setProperty("--font-display", b.fonts.display);
  root.style.setProperty("--font-body", b.fonts.body);
  root.style.setProperty("--font-mono", b.fonts.mono);
}
