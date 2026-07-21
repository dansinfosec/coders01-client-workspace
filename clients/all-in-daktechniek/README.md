# All-in Daktechniek — Coders01 klantproject

Modernisering/rebuild van de website van **All-in Daktechniek** (dakdekkersbedrijf,
Honselersdijk). Contactpersoon: **Borre Van der Wal**.
Status: **potentiële klant / gratis demo — niet publiceren**.

Onderdeel van de Coders01 multiclient-workspace. Volgt de bestaande werkwijze en
technische standaarden (React 18 + Vite 5 + strict TypeScript + Tailwind + React Router;
zie `clients/roofing-center-react-mvp/` als referentie).

## Mapstructuur

```
all-in-daktechniek/
├─ scraped/pages/     ruwe HTML van de live site (bronregistratie, 2026-07-21)
├─ analysis/          (gereserveerd voor latere audits/rapporten)
├─ assets/
│  ├─ original/       16 gedownloade originele beelden van de live site
│  └─ optimized/      geoptimaliseerde WebP/JPEG voor de rebuild (volgt)
├─ rebuild/           de nieuwe React + Vite site (fase 1: demo)
├─ docs/              projectdocumentatie (start hier)
└─ README.md          dit bestand
```

## Documentatie (lees in deze volgorde)

1. `docs/PROJECT-BRIEF.md` — opdracht, doelen, bevestigde bedrijfsgegevens
2. `docs/CURRENT-SITE-AUDIT.md` — technische staat + grootste problemen
3. `docs/CONTENT-INVENTORY.md` — alle pagina's, diensten, claims, formulieren
4. `docs/ASSET-INVENTORY.md` — gedownloade beelden + beoordeling
5. `docs/SEO-AUDIT.md` — SEO/lokale vindbaarheid
6. `docs/SITEMAP-PROPOSAL.md` — voorgestelde nieuwe structuur
7. `docs/DESIGN-DIRECTION.md` — merk, palet, secties
8. `docs/NEXT-ACTIONS.md` — **levend** takenlijst + wat nog van Borre nodig is

## Belangrijke regels

- **Geen bedrijfsfeiten verzinnen.** Onbekende waarden blijven leeg met
  `TODO: Confirm with client`. Zie de "Nodig van Borre"-lijst in `docs/NEXT-ACTIONS.md`.
- Niets aan de live site wijzigen; geen publicatie/deploy zonder expliciete opdracht.
- Bevestigde bedrijfsgegevens: Stationsweg 53, 2675 AM Honselersdijk · 06 53252125 /
  06 42059084 · info@all-indaktechniek.nl · KvK 73998400.

## Rebuild draaien (na scaffold)

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\all-in-daktechniek\rebuild
npm install
npm run dev        # http://localhost:5173
npm run lint; npm run typecheck; npm run build; npm run preview
```
