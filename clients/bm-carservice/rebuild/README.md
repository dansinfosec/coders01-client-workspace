# BM Carservice — rebuild

Nieuwe website voor BM Carservice (autogarage, Amstelveen). React + Vite + strict
TypeScript + Tailwind. Frontend-only in deze fase.

## Commands
```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # tsc --noEmit + vite build → dist/
npm run preview     # serveer de productie-build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint --max-warnings 0
npm run prepare:images  # optioneel: foto's uit ../assets/original → public/images/bm-carservice/ (WebP)
```

## Architectuur
- **Content = data.** Alles staat in `src/data/*` (`company`, `services`, `apkLandings`,
  `distributieketting`, `pages`, `navigation`, `reviews`). Nieuwe dienst/locatie/merk =
  één object toevoegen. Labels: `VERIFIED` (van de live site) of `TODO` (bevestigen met klant).
- **Templates.** `ServiceDetailPage` (`/diensten/:slug` + `/remmen-vervangen`), `LandingPage`
  (APK-locaties/varianten, distributieketting-merken, chiptuning, ANWB), hubs voor APK en
  distributieketting. Bestaande URLs blijven 1:1 behouden (SEO).
- **Designsysteem.** Tokens in `src/index.css` + `tailwind.config.js` (ink/signal/mark/…).
  Signature: `HazardDivider` + het receptiebord in `sections/Hero`. Fonts: Archivo +
  IBM Plex Sans/Mono (non-render-blocking geladen).
- **SEO.** `components/SEO` (unieke title/description/canonical/OG per pagina) +
  `components/StructuredData` (`AutoRepair` JSON-LD: NAW, openingstijden, werkgebied).

## Nog te bevestigen met de klant (TODO — niets verzonnen)
- KvK/BTW · endpoint afspraakformulier (`VITE_APPOINTMENT_ENDPOINT`, nu mailto-fallback)
- Herkomst/echtheid reviews (nu alleen geaggregeerde cijfers, geen JSON-LD rating, geen quotes)
- Actualiteit van de "vanaf"-prijzen · weekend-/afdelingsopeningstijden · transparant logo
- Definitieve cookie-/privacyteksten

## Assets
Bronfoto's staan in `../assets/original/` (37 stuks). De site is bewust signage/typografie-
gedreven en werkt zonder foto's; selecteer desgewenst enkele foto's en draai `prepare:images`.
