# Client — BM Carservice

Auto garage in Amstelveen — APK (zonder afspraak), onderhoud, reparatie, banden.
Rebuild binnen de Coders01 multiclient-workspace.

- **Live site:** https://bmcarservice.nl/
- **Engagement gestart:** 2026-07-30
- **Status:** 🟡 Fase 1 (Crawl) — verkenning afgerond, rebuild nog niet gestart
- **Stack (besloten):** Vite 5 + React 18 + strict TypeScript + Tailwind + react-router-dom
  (all-in-daktechniek-conventie)
- **Scope-besluit:** diensten consolideren via dynamische `[slug]`-templates, bestaande
  URLs/SEO-dekking behouden.

---

## Mapstructuur

| Map | Inhoud |
|---|---|
| `scraped/` | Crawler-output: `pages/*.html`, `index.json`, `crawl-report.json` |
| `assets/` | `original/` (ruwe images incl. logo), `optimized/` (WebP voor rebuild) |
| `analysis/` | Audits en losse analyses |
| `docs/` | Brief, content-inventaris, asset-inventaris, SEO-audit, sitemap-voorstel, designrichting |
| `rebuild/` | De nieuwe React + Vite + TS site |

---

## Bevestigde bedrijfsgegevens (VERIFIED — van de live site, 2026-07-30)

- **Naam:** BM Carservice
- **Slogan:** "Uw veiligheid is ons beroep!"
- **Adres:** Bouwerij 69A, 1185 XW Amstelveen
- **Telefoon:** 020 – 345 1566 (0203451566)
- **E-mail:** info@bmcarservice.nl
- **WhatsApp:** aanwezig (nummer = vast telefoonnummer)
- **Openingstijden:** ma–vr 08:30–13:00 en 13:45–17:30 · weekend gesloten
- **Regio:** Amstelveen, Amsterdam, Aalsmeer, Uithoorn
- **Kwalificaties:** RDW-gecertificeerd · ANWB-partnerbedrijf (Wegenwacht-normen)
- **ANWB Alarmcentrale (op site vermeld):** 088-2692888
- **Social:** X (Twitter) — @BmCarservice

### TODO: Confirm with client
- KvK-nummer (niet op de site vermeld)
- BTW-nummer
- Echte klantreviews / bronnen (Reviews-pagina bestaat — inhoud verifiëren, niet verzinnen)
- Exacte prijzen (niet publiek vermeld — nooit invullen zonder bevestiging)
- E-mailadres voor het afspraakformulier / backend-integratie

---

## Merkidentiteit (VERIFIED — visueel van de live site)

- **Primair:** fel geel (header + topbalk)
- **Secundair:** donker navy/antraciet
- **Accent:** rood (logo-auto-icoon, actieve navigatie)
- **Neutraal:** wit / near-black tekst (#101010)
- **Typografie:** Lato (fallback: Hanken Grotesk, Arial)
- **Elementen:** image-slider hero · groene WhatsApp-floatknop · rood auto-icoon-logo

---

## Naleving

- Alleen geautoriseerde publieke content gecrawld (`docs/SCRAPING-POLICY.md`); `robots.txt`
  gerespecteerd, rate-limited.
- Geen bedrijfsfeiten verzonnen — onbekende waarden staan hierboven als `TODO`.
- Client-isolatie: alle output blijft onder `clients/bm-carservice/`.
