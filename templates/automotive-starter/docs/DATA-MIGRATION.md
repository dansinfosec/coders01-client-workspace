# Data-migratie & content

Hoe je klantcontent invoert: van crawlerresultaten naar diensten, occasions en assets,
en hoe de mock-services later door een echte backend worden vervangen.

---

## 1. Content verzamelen (crawl)

De workspace heeft een herbruikbare crawler en image-downloader:

```powershell
# 1) Pagina's crawlen (respecteert robots.txt + rate limits — zie docs/SCRAPING-POLICY.md)
py automation\crawler\crawler.py https://www.<klant>.nl --client <klant>

# 2) Afbeeldingen/media downloaden op basis van de crawl
py automation\image-downloader\image_downloader.py --client <klant>
```

Output landt in `clients/<klant>/scraped/` (rauwe HTML + `index.json` + `crawl-report.json`).

**Regels:** crawl alleen wat je mag crawlen. Verzin geen gegevens. Onbekend blijft `null`
of wordt niet getoond. Neem geen dunne SEO-doorway-pagina's 1-op-1 over.

## 2. Gegevens verifiëren

Leid uit de crawl de feiten af en **verifieer** ze voordat je ze invoert:

- Bedrijfsgegevens (NAP), openingstijden, socials → `src/data/company.ts`
- Merkkleuren, logo, favicon → `src/config/brand.ts` (zie `BRANDING-GUIDE.md`)
- Diensten → `src/data/services.ts`
- Occasions (specs, prijzen, foto's, status) → `src/data/occasions.ts`

Twijfel je over een waarde? Laat hem `null` en zet een `// TODO: bevestigen met klant`.

## 3. Assets plaatsen

Zet gedownloade, klant-eigen bestanden onder `public/assets/` met **SEO-vriendelijke
namen**. Geen hotlinking naar externe URL's.

```
public/assets/
├─ brand/       # logo(varianten), favicon-bron, og-image
├─ services/    # dienstafbeeldingen (bijv. apk-keuring.jpg)
├─ occasions/   # per occasion een submap: <slug>/1.jpg, 2.jpg, …
└─ general/     # hero's, werkplaatsfoto's, team, overig
```

Verwijs ernaar met een absoluut pad vanaf `public`, bijv. `/assets/services/apk-keuring.jpg`.

## 4. Diensten invoeren (`src/data/services.ts`)

Elke dienst is een `Service`-object. Velden:

- `slug` (URL, uniek), `title` (H1), `shortLabel` (nav/kaart), `icon` (lucide-react)
- `summary`, `intro`, `includes[]`, `benefits[]`, `process[]`, `faq[]`
- `related[]` (slugs van verwante diensten), optioneel `showApkOffer`
- `seo.title` / `seo.description` — **zonder** merknaam; de `<SEO>`-component voegt die toe

De template levert een complete, merk-neutrale set garage-diensten. Pas teksten aan of
voeg diensten toe; houd de `slug`s stabiel (ze zitten in URL's en interne links).

## 5. Occasions invoeren (`src/data/occasions.ts`)

Vervang de demo-auto's. Per `Occasion`:

- `slug`, `status` (`beschikbaar` | `gereserveerd` | `verkocht` | `nieuw-binnen` | `binnenkort`)
- Specs: `merk`, `model`, `uitvoering`, `bouwjaar`, `brandstof`, `transmissie`, `kmStand`,
  `prijs` (`null` = op aanvraag), enz. — **onbekend = `null`**, niet verzinnen
- `highlights[]`, `description`, optioneel `bijzonderheden` (eerlijke meldingen)
- `photos[]`: `{ src, alt }` — koppel de foto's uit `public/assets/occasions/<slug>/`
  met **betekenisvolle alt-teksten**. Leeg = de UI toont een nette placeholder.

## 6. Mock-services → echte backend

Componenten praten nooit rechtstreeks met data; ze gaan via de `src/services/*`-laag:

| Service | Nu (mock) | Later (backend) |
|---|---|---|
| `services/occasionService.ts` | leest `data/occasions.ts` | `GET /api/occasions` |
| `services/planningService.ts` | simuleert beschikbaarheid/boeking | `POST /api/afspraken` |
| `services/vehicleSaleService.ts` | simuleert leadverzending | `POST /api/verkoopleads` |
| `services/rdwService.ts` | `/api/rdw` proxy + RDW-fallback | ongewijzigd |

Koppelen doe je zó:

1. Zet het endpoint in `.env` (`VITE_APPOINTMENT_ENDPOINT`, `VITE_VEHICLE_SALE_ENDPOINT`);
   `company.ts` leest deze al.
2. Implementeer de echte `fetch` in de betreffende service (zelfde functiesignatuur en
   returntypes → **geen** componentwijzigingen nodig).
3. Zet `features.demoDisclaimers = false` zodra gegevens echt worden opgeslagen.

> Zolang er geen backend is: **beloof niet** dat gegevens worden opgeslagen. De
> demo-meldingen (schakelbaar via `features.demoDisclaimers`) houden dit eerlijk.

## 7. Na de migratie

Loop [`NEW-CLIENT-CHECKLIST.md`](NEW-CLIENT-CHECKLIST.md) §8 (verificatie) af:
typecheck, lint, build, responsive test, en controleer dat geen enkele placeholder of
`TODO` meer zichtbaar is.
