# BM Carservice — Next Actions

_Datum: 2026-07-30_

## Klaar (Fase 1–4)
- [x] Live site gecrawld (`scraped/`, 33 tekstextracten in `scraped/text/`)
- [x] Assets gedownload (`assets/original/`, 38 bestanden + `image-index.json`)
- [x] Audit + inventarissen + sitemap + designrichting (`docs/`)
- [x] **Rebuild gebouwd** (`rebuild/`): volledige React + Vite + strict TS + Tailwind-site —
  alle routes (diensten, APK-hub + locaties, distributieketting-hub + merken, chiptuning, ANWB,
  reviews, afspraak, contact, legal), designsysteem (receptiebord-hero, hazard-signature,
  Archivo/IBM Plex), afspraakformulier (rhf + zod), SEO per pagina + `AutoRepair` JSON-LD.
- [x] **Geverifieerd:** `npm run lint` (0 warnings) · `tsc --noEmit` · `npm run build` ·
  browsercheck desktop (home, dienstdetail). Geen horizontale overflow, één `<h1>`, JSON-LD live.

## Nog te doen op de rebuild (klein / optioneel)
- [x] **Foto's geplaatst** (luxe uitstraling): 8 geoptimaliseerde WebP's + `og-default.jpg` in
  `rebuild/public/images/bm-carservice/`. Full-bleed glass-hero (workshop), "Onze garage"-
  showcase (gevel/receptie/werkplaats met mono-captions), sfeerbeeld op dienstdetail, ANWB-
  pechhulpfoto. Beeld-helper: `src/lib/images.ts` (met afmetingen → geen layout shift).
1. **Mobiele visuele check** op echte 320/375/390/430 (tool-viewport kon niet verkleinen;
   responsive-classes staan wel).
2. `apple-touch-icon.png` toevoegen in `rebuild/public/` (favicon.svg + og-default staan er al).
3. Eventueel meer/andere foto's: `assets/original/` bevat 37 stuks; pas de mapping in
   `scripts/optimize-images.mjs`-stijl of `src/lib/images.ts` aan.

## TODO — bevestigen met klant (niet verzinnen)
- [ ] KvK- en BTW-nummer
- [ ] Endpoint/e-mail voor het afspraakformulier
- [ ] Herkomst/echtheid van de reviews (bron voor evt. `AggregateRating`)
- [ ] Prijzen tonen? (nu nergens vermeld)
- [ ] Transparant/vector-logo (huidige = 192px JPEG)
- [ ] URL-strategie: bestaande APK-locatie-URL's 1:1 behouden of 301 naar `/apk-keuring/:plaats`

## Naleving-reminder (bij afronden meaningful werk)
Obsidian bijwerken: `Coders01 - Current State`, clientnote aanmaken in `03 Clients`,
`Decisions Log` (stack + consolidatie-besluit), `Next Actions`. Nog niet committen/pushen/deployen.
