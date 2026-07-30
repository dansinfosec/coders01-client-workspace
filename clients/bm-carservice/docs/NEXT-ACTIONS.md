# BM Carservice — Next Actions

_Datum: 2026-07-30_

## Klaar (Fase 1–3)
- [x] Live site gecrawld (`scraped/`, 33 tekstextracten in `scraped/text/`)
- [x] Assets gedownload (`assets/original/`, 38 bestanden + `image-index.json`)
- [x] Audit + inventarissen + sitemap + designrichting (`docs/`)

## Volgende (Fase 4 — Rebuild) — wacht op akkoord
1. Scaffold `rebuild/` = kopie van de all-in-daktechniek-stack (Vite 5 + React 18 + strict TS
   + Tailwind + router + react-hook-form/zod + react-helmet-async + lucide-react).
2. Tailwind-config vullen met de tokens uit `DESIGN-DIRECTION.md`; fonts (Archivo, IBM Plex
   Sans/Mono) laden.
3. `src/data/*.ts` vullen uit `scraped/text/*.txt` (services, apk-locaties, distributieketting-
   merken, company/navigation) — met `VERIFIED`/`PLACEHOLDER`-labels.
4. Beelden optimaliseren → `assets/optimized/` → `public/images/bm-carservice/`.
5. Pagina's + componenten bouwen volgens `SITEMAP-PROPOSAL.md` (dynamische templates).
6. SEO: unieke titles/descriptions + `AutoRepair` structured data (zie `SEO-AUDIT.md`).
7. Verify: lint · `tsc --noEmit` · build · responsive 320/375/390/430/desktop.

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
