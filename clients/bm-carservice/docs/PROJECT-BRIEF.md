# BM Carservice — Project Brief

_Datum: 2026-07-30_

## Overview
- **Target URL:** https://bmcarservice.nl/
- **Industry:** Auto garage / autoservice (APK, onderhoud, reparatie, banden)
- **Locatie:** Bouwerij 69A, 1185 XW Amstelveen — regio Amstelveen/Amsterdam/Aalsmeer/Uithoorn
- **Status:** 🟡 Verkenning afgerond — rebuild nog niet gestart

## Scope
- **In scope:** volledige publieke website herbouwen als moderne React + Vite SPA.
- **Besluit (2026-07-30):** de ~34 bestaande routes **consolideren** — diensten via één
  dynamische `[slug]`-template, APK als hub met locatievarianten — met behoud van bestaande
  URLs en SEO-dekking.
- **Out of scope (voorlopig):** backend voor het afspraakformulier (frontend + nette mailto/
  webhook-stub tot de klant een endpoint bevestigt); echte betaal-/boekingsintegratie.

## Goals
- **Business:** meer afspraken/leads (APK zonder afspraak is de kernpropositie).
- **Behouden:** merkidentiteit (geel/navy/rood, Lato), bedrijfsgegevens, bestaande URL-structuur
  voor SEO, ANWB-partner- en RDW-vermeldingen.
- **Verbeteren:** SEO-metadata (huidige site heeft nauwelijks meta-descriptions),
  performance, mobiele opbouw, toegankelijkheid, conversie (duidelijkere CTA's).

## Constraints
- **Tech:** Vite 5 + React 18 + strict TypeScript + Tailwind + react-router-dom.
- **Content:** geen bedrijfsfeiten verzinnen; onbekende waarden → `TODO: Confirm with client`.
- **Deploy:** nog niet — geen commit/push/deploy zonder expliciete opdracht.

## Openstaande vragen voor de klant
- KvK- en BTW-nummer
- Backend/e-mail-endpoint voor het afspraakformulier
- Herkomst en echtheid van de reviews op de Reviews-pagina
- Wel/niet prijzen tonen
- Aanvullende social kanalen (nu alleen X/Twitter)

## Voortgang
| Fase | Map | Status |
|---|---|---|
| 1. Crawl    | `scraped/`  | ✅ 50 pagina's (33 unieke content-pagina's + tekstextracten) |
| 2. Assets   | `assets/`   | ✅ 38 bestanden (37 foto's + logo) in `original/` |
| 3. Analyse  | `docs/`     | ✅ audit, content-, asset-, SEO-inventaris, sitemap, designrichting |
| 4. Rebuild  | `rebuild/`  | ⬜ not started — wacht op akkoord |
| 5. Verify   | —           | ⬜ not started |
