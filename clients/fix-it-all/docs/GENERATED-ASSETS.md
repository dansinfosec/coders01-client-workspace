# Gegenereerde & echte beeld-assets

## 1. AI-gegenereerde dienstbeelden (illustratief)

Negen fotorealistische, **illustratieve** werkplaatsbeelden zijn gegenereerd met **Higgsfield**
(model **nano_banana**, unlim-variant `nano_banana_flash`, 16:9, native 1376×768 → geüpscaled en
gecropt naar **1600×900 WebP**, q82). Consistente Europese werkplaatsstijl, geen tekst/logo's.

> **Belangrijk:** dit zijn **AI-gegenereerde, illustratieve** beelden — géén echte foto's van het
> team, pand of specifieke werkzaamheden. Alt-teksten zijn neutraal ("Illustratieve
> werkplaatsomgeving — <dienst>") en presenteren ze nergens als echte documentatie.

Lokale map: `public/assets/generated/services/` · Formaat: WebP 1600×900 (16:9).

| Slug | Bestand | Gebruikspagina('s) | Alt-tekst | Prompt (kern) |
|---|---|---|---|---|
| `apk-keuring` | `apk-keuring.webp` | Home (featured) + `/diensten/apk-keuring` | Illustratieve werkplaatsomgeving — APK-keuring | Keurmeester inspecteert auto op hefbrug met inspectielamp |
| `onderhoud` | `auto-onderhoud.webp` | Home (medium) + `/diensten/onderhoud` | … — Onderhoud | Monteur voert onderhoud uit onder de motorkap |
| `uitlaat-laswerk` | `uitlaat-laswerk.webp` | Home (medium) + `/diensten/uitlaat-laswerk` | … — Uitlaat & laswerk | Monteur last/repareert uitlaat onder auto op brug |
| `airco-service` | `aircoservice.webp` | Home (medium) + `/diensten/airco-service` | … — Aircoservice | Technicus sluit aircoserviceapparatuur aan |
| `bandenservice` | `bandenservice.webp` | Home (medium) + `/diensten/bandenservice` | … — Bandenservice | Monteur monteert/balanceert band op balanceermachine |
| `diagnose` | `diagnose.webp` | Home (thumbnail) + `/diensten/diagnose` | … — Diagnose | Technicus met diagnosescanner aan OBD-poort |
| `reparatie` | `reparatie.webp` | Home (thumbnail) + `/diensten/reparatie` | … — Reparatie | Monteur repareert remmen/ophanging met handgereedschap |
| `kleine-beurt` | `kleine-beurt.webp` | Home (thumbnail) + `/diensten/kleine-beurt` | … — Kleine beurt | Olie- en filterverversing, inspectiemoment |
| `grote-beurt` | `grote-beurt.webp` | Home (thumbnail) + `/diensten/grote-beurt` | … — Grote beurt | Uitgebreide beurt, auto op brug, meerdere controlepunten |

Gemeenschappelijke prompt-stijl: _"Photorealistic wide horizontal photo for a web card … modern
tidy Dutch/European independent car repair workshop … dark graphite/charcoal colour grading with a
subtle warm red accent glow … no text, no logos, no readable brand names, no watermarks, realistic
undistorted hands and vehicles, no futuristic machines."_

Centrale koppeling: `src/config/assets.ts` (`serviceImage[slug]`) — één plek, geen verspreide paden.
Consumptie: `HomeServices.tsx` (featured + medium + thumbnail image cards, hover-zoom + card-lift) en
`ServiceDetailPage.tsx` via `PageHero` (`image`-prop, gradient-overlay, titel-overlay). Fallback naar
een graphite/blueprint-vlak **alleen** als een bestand echt ontbreekt (nooit een leeg zwart vlak).

## 2. Echte beelden (geen AI)

| Bestand | Doel | Bron | Alt |
|---|---|---|---|
| `public/assets/general/werkplaats-gevel.jpg` | Homepage-hero (graphite-overlay) | Echte foto van het pand (uit occasion-listing) | decoratief (`aria-hidden`) |
| `public/assets/general/forecourt.jpg` | "Auto verkopen"-split | Echte foto van de oprit/gevel | "Auto's op de oprit voor onze werkplaats" |
| `public/assets/occasions/<slug>/*.jpg` (292×) | Occasions | Echte dealerfoto's (Autodealers-voorraad) | per foto beschrijvend |

## 3. Technische controle

- Alle 9 WebP-bestanden bestaan fysiek en worden bij `vite build` naar `dist/assets/generated/services/`
  gekopieerd (geverifieerd).
- Vite public-paths (`/assets/generated/services/<slug>.webp`) — geen 404's.
- `loading="lazy"` buiten de hero/featured; `width`/`height` (1600×900) tegen layout shift.
- Overlays geven voldoende contrast; hover-zoom/reveal respecteren `prefers-reduced-motion`.

## 4. Nog gewenst (echte klantfoto's)

De AI-beelden zijn illustratief. Voor maximale authenticiteit kan de klant later eigen foto's van de
échte werkplaats/gevel/team aanleveren; die vervangen dan de illustratieve beelden via dezelfde
`serviceImage`-mapping (zelfde paden of nieuwe onder `public/assets/`).
