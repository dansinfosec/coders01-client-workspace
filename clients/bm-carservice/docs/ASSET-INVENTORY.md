# BM Carservice — Asset-inventaris

_Datum: 2026-07-30_

## Gedownload → `assets/original/` (38 bestanden, 5,5 MB)
- **37 content-foto's** (WebP) van `cdn.autosociaal.nl` — grootste beschikbare variant per
  beeld (dedupe op stabiele CDN-identiteit; thumb-groottes samengevoegd). Bron: garage-
  interieur/exterieur, werkplaats, receptie, dienstgerelateerde foto's.
- **1 logo** `37-bm-logo.jpg` (192×192, JPEG — géén transparantie).

Volledige mapping (bron-URL, bronpagina's, status) staat in `assets/image-index.json`.

## Herkomst / toestemming
Eigen publieke beelden van de klantsite, opgehaald voor de rebuild. `robots.txt`
gerespecteerd. De AutoSociaal/DealerTemplates platform-branding (`autosociaal.svg`,
`dealertemplates.svg`, generiek `whatsapp_logo.png`) is **bewust niet** gedownload.

## Nog te doen
- **WebP/afmetingen optimaliseren** → `assets/optimized/` via `scripts/optimize-images.mjs`
  (sharp), daarna kopiëren naar `rebuild/public/images/bm-carservice/`.
- Foto's **labelen/koppelen** aan diensten (nu generieke bestandsnamen) — handmatig
  visueel matchen tijdens de rebuild.
- **TODO klant:** transparant/vector-logo (SVG of PNG met alfa); huidige is een 192px JPEG.
- **TODO klant:** hi-res hero/pand-foto's indien beschikbaar (CDN-varianten max ~2560px).
