# Allround Schadeherstel Utrecht — klantpreview

Frontend-only MVP-preview voor **Allround Schadeherstel Utrecht** — allround
schadeherstel voor auto, motor, scooter en boot, voor particulieren, bedrijven en
verzekeringsschades. Nederlandstalige one-page site, gebouwd om zowel B2B-partners
aan te spreken als rechtstreeks particuliere leads te genereren.

> **Preview-only.** Niet gedeployed, niet gecommit. Zie
> [`rebuild/PREVIEW-NOTE.md`](rebuild/PREVIEW-NOTE.md) en
> [`docs/SOURCE-REPORT.md`](docs/SOURCE-REPORT.md).

## Projectstructuur
```
allround-schadeherstel-utrecht/
  README.md                 dit bestand
  .gitignore                negeert node_modules/dist + ruwe asset-drops
  docs/SOURCE-REPORT.md     bronnen, verificatie, kosten, provenance, claims
  assets/original/
    logo.jpeg               aangeleverd logo (ongewijzigd)
    google-preview-raw/     ruwe Google-foto's (leeg; gitignored)
    higgsfield-preview-raw/ ruwe AI-beelden (gitignored)
  rebuild/                  de Vite + React + TS + Tailwind app
    PREVIEW-NOTE.md         preview-/productiestatus
    index.html              SEO + JSON-LD (AutoRepair)
    scripts/optimize-images.mjs   sharp: logo + AI-beelden -> WebP/PNG
    public/images/
      brand/                geoptimaliseerd logo (webp + png)
      ai-preview/           AI-sfeerbeelden (webp)
      google-preview/       (leeg; voor toekomstige eigen foto's)
    src/
      data/                 centrale datalaag (single source of truth)
      components/{layout,sections,ui}
      hooks/                useLockBodyScroll, useOpenStatus
      utils/cn.ts
```

## Installatie & commando's
Vanuit `rebuild/`:
```bash
npm install            # dependencies
npm run dev            # dev-server (Vite)
npm run lint           # ESLint (max-warnings 0)
npm run typecheck      # tsc --noEmit
npm run build          # typecheck + productie-build -> dist/
npm run preview        # serve de productie-build lokaal
npm run prepare:images # optimaliseer logo + AI-beelden naar WebP/PNG (sharp)
```

## Architectuur
- **Vite + React 18 + TypeScript (strict)** met semantische, toegankelijke HTML.
- **Tailwind CSS** met centrale designtokens als CSS-variabelen
  (`src/index.css`) → semantische kleuren in `tailwind.config.js`. De hoofdkleuren
  (antraciet `#242424`, oranje accent `#C65000`) zijn **gemeten uit het logo**.
- **Centrale datalaag** (`src/data/`): `business.ts` is de single source of truth
  voor NAP, openingstijden, coördinaten, servicegebieden, voertuigcategorieën en
  `leadConfig`. Verder `nav.ts`, `services.ts`, `vehicles.ts`, `gallery.ts`,
  `reviews.ts`. Geen bedrijfsgegevens hardcoded in componenten.
- **Componenten**: `layout/` (header, mobiel menu, sticky action bar, footer,
  logo), `sections/` (hero, trust, voertuigen, diensten, B2B, verzekering,
  werkwijze, galerij, over, contact, schadeformulier), `ui/` (Button, Container,
  Section, VehicleIcon).
- **Toegankelijkheid**: één H1, logische headings, zichtbare focus, mobiel menu met
  `aria-expanded`, scroll-lock, Escape-sluiten en focus-terugkeer; toegankelijke
  lightbox (Escape, pijltjes, focustrap, focus-terugkeer); `prefers-reduced-motion`.
- **SEO**: title, meta description, Open Graph, favicon, canonical-placeholder en
  `AutoRepair` JSON-LD met uitsluitend geverifieerde gegevens (geen fake rating/FAQ).
- **Beeldpipeline**: `scripts/optimize-images.mjs` (sharp) bijsnijdt/optimaliseert
  het logo (WebP + PNG) en converteert AI-bronbeelden naar breedte-gecapte WebP.
  Originelen worden nooit overschreven.

## Vercel deployment
De app is technisch klaar voor Vercel (config in `rebuild/vercel.json`). Er is
**nog niet gedeployed**. Instellingen:

- **Root Directory:** `clients/allround-schadeherstel-utrecht/rebuild`
- **Framework Preset:** Vite
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment variables:** géén nodig (statische frontend, geen backend/secrets)
- **Node:** vastgelegd via `engines` (`22.x`) voor een reproduceerbare build.

`vite base` staat op de standaard `'/'` — correct voor een normaal Vercel-domein
op de root. Er zijn geen SPA-rewrites nodig: de site is één pagina met
anchor-links, zonder client-side subroutes.

> **Na domeinkeuze in te vullen:** vervang het placeholder-domein
> `https://www.allround-schadeherstel-utrecht.example/` in `index.html`
> (`canonical`, `og:url`, `og:image`, JSON-LD `url`/`image`/`logo`) door het
> definitieve productiedomein.

## MVP-status
- ✅ Lint, typecheck en productie-build slagen.
- ✅ Responsief geverifieerd op 320 / 390 / 768 / 1280 px, geen horizontale overflow,
  geen console errors.
- ✅ Bedrijfsgegevens geverifieerd via Google Places (zie SOURCE-REPORT).
- ⚠️ Beelden zijn AI-sfeerbeelden (preview) — owner-goedkeuring nodig.
- ⚠️ Formulier is demo (geen backend); domein/canonical zijn placeholders.

Openstaande productiepunten: zie [`rebuild/PREVIEW-NOTE.md`](rebuild/PREVIEW-NOTE.md).
