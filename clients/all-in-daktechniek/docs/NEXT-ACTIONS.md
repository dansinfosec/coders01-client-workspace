# NEXT-ACTIONS — All-in Daktechniek

_Levend document. Bij updates bestaande notities behouden en nieuwe dateren._
_Aangemaakt: 2026-07-21._

## 2026-07-21 — Inventarisatie afgerond

- [x] Live site geïnspecteerd met Claude Browser (11 pagina's + sitemap/robots/schema).
- [x] Content, navigatie, diensten, formulieren, CTA's, bedrijfsgegevens in kaart.
- [x] 16 assets gedownload → `assets/original/` + afmetingen bepaald.
- [x] Ruwe HTML per pagina bewaard → `scraped/pages/`.
- [x] Docs geschreven: PROJECT-BRIEF, CURRENT-SITE-AUDIT, CONTENT-INVENTORY,
      ASSET-INVENTORY, SEO-AUDIT, SITEMAP-PROPOSAL, DESIGN-DIRECTION.
- [x] Demo-rebuild fase 1 in `rebuild/` afgerond (zie sectie hieronder).

## ⛔ Nodig van Borre (blokkeert echte content / launch — niets van verzinnen)

- [ ] **Openingstijden** (voor footer + `LocalBusiness`-schema).
- [ ] **Exact werkgebied** — welke plaatsen/regio's bedient All-in? (Alleen vestiging
      Honselersdijk/Westland is bekend uit het adres.)
- [ ] **Welke claim is leidend** bij de tegenstrijdigheden op de huidige site:
      - ervaring: "gemiddeld 20 jaar" (home) vs "Ruim 15 jaar" (footer)?
      - garantie: 12 jaar (home) / 15 jaar (pannendaken) / 10 jaar (zinkwerk) — per dienst
        of één bedrijfsbrede belofte?
- [ ] **VCA-certificaat**: bevestiging + eventueel nummer/bewijs om te tonen.
- [ ] **Hi-res / vector-logo** (SVG of PNG ≥ 1000 px) + favicon-bron. Huidige is 259×77.
- [ ] **Teamfoto's** + kort "over ons"-verhaal (voor Over-ons-pagina).
- [ ] **Projectfoto's + beschrijving** (type werk, plaats, jaar; liefst vóór/na).
- [ ] **Reviews/beoordelingen** — staan nu nergens; aanleveren of Google-reviews koppelen.
- [ ] **Relatie tot "Frisse Zonwering"** (verschijnt in footer/menu) — tonen of weghalen?
- [ ] **Tweede telefoonnummer** (06 42059084): van wie / waarvoor tonen?
- [ ] Voorkeur **contactkanaal** (formulier vs e-mail vs WhatsApp) voor de primaire CTA.

## Rebuild — fase 1 (demo) — 2026-07-21 AFGEROND ✅

- [x] Vite + TS + Tailwind scaffold in `rebuild/` (roofing-center als basis).
- [x] All-in merkpalet (antraciet + natuurlijk-groen + warm wit) in tokens.
- [x] `src/data/company.ts` met **bevestigde** NAP/KvK/telefoon/e-mail/social; onbekende
      velden leeg + `TODO: Confirm with client`.
- [x] Header + mobiele navigatie (portal, scroll-lock, focus-trap, 44px, sluit op
      link/backdrop/Escape, sluit bij resize naar desktop).
- [x] Hero met offerte-CTA + bel/WhatsApp.
- [x] Vertrouwensbalk (alleen echte feiten; garantie per dienst, niet bedrijfsbreed).
- [x] Dienstenblok (7 diensten) + dienstenoverzicht + dienstpagina's (`/diensten/:slug`).
- [x] Over-ons-sectie + `/over-ons` (uit homepage-blok).
- [x] Projectengalerij (echte foto's) + `/projecten`.
- [x] Werkgebied-/lokale-SEO-sectie + `/werkgebied` (regio als raamwerk tot bevestiging).
- [x] Offerteformulier (RHF + Zod; velden uit bestaand formulier) — frontend-only demo.
- [x] Footer met correcte bedrijfsgegevens (NAP, 2 telefoons, e-mail, KvK, Facebook).
- [x] Mobiele sticky bel/WhatsApp/offerte-balk (verborgen achter open menu).
- [x] FAQ-pagina + FAQ-schema; Basis-SEO (`react-helmet-async`) + `RoofingContractor`/
      `LocalBusiness` structured data (grootste lokale-SEO-winst t.o.v. oude site).
- [x] Beeld geoptimaliseerd naar `assets/optimized/` + `public/` (12 WebP + favicon).
- [x] Responsive geverifieerd 320/375/390/430/1280: geen horizontale overflow.
- [x] **lint 0 · tsc 0 · build ✓** (330 kB JS / 99 kB gzip, 22 kB CSS). Geen console-errors.

**Nog te doen in de demo (fase 2, na input Borre):**
- [ ] Echte openingstijden, werkgebied-plaatsen, teamfoto's, projectbeschrijvingen invullen.
- [ ] Hi-res/vector-logo verwerken i.p.v. tekst-wordmerk.
- [ ] Garantie/ervaring-claim uniformeren zodra Borre de juiste waarde bevestigt.
- [ ] Google Maps-embed op contact/werkgebied na akkoord.

## Later / bij livegang (niet nu)

- [ ] 301-redirects oud→nieuw (zie SITEMAP-PROPOSAL).
- [ ] Consent-vriendelijke analytics.
- [ ] Backend/lead-endpoint voor formulier (nu frontend-only).
- [ ] Domein/deploy — **alleen na expliciete opdracht**.

## Openstaande beslissingen

- Losse dienstpagina's voor "renovatie" en "service onderhoud", of onderbrengen bij
  bestaande diensten? (Voorstel: onderbrengen, tenzij Borre aparte pagina's wil.)
