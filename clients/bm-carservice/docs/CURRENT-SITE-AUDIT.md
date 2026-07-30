# BM Carservice — Audit huidige website

_Datum: 2026-07-30 · bron: https://bmcarservice.nl/ (crawl 50 pagina's + browserinspectie)_

## Platform & techniek
- Gebouwd op **AutoSociaal / DealerTemplates** (Nederlands autobranche-CMS). Afbeeldingen
  komen van `cdn.autosociaal.nl` (origin: S3 `dt-dev1`).
- **Client-side / template-gerenderd**: slider en veel media laden via JS en CSS
  `background-image`. Content-tekst staat wél gewoon in de HTML (goed voor SEO-migratie).
- Font: **Lato**. Hero = image-slider (`slick`). Groene WhatsApp-floatknop.

## Wat goed is (behouden)
- Duidelijke, sterke propositie: **APK zonder afspraak** in de regio.
- Rijke inhoudelijke dienstteksten (500–4.200 tekens per dienstpagina) — geschikt als basis.
- Sterke lokale + merkfocus (Amstelveen/Amsterdam/Aalsmeer/Uithoorn; distributieketting
  per merk VW/Audi/Seat/Skoda).
- Vertrouwenssignalen: RDW-gecertificeerd, ANWB-partnerbedrijf, reviews (15 pagina's).

## Belangrijkste zwaktes (verbeteren in de rebuild)
| # | Bevinding | Impact |
|---|---|---|
| 1 | **Geen echte meta-descriptions** — elke `<meta description>` is een duplicaat van de titel ("BM Carservice - APK") | SEO / CTR |
| 2 | **Homepage heeft geen `<h1>`** (begint bij `<h2>`); zwakke koppenhiërarchie | SEO / a11y |
| 3 | Generieke `<title>`s ("BM Carservice - X"), niet keyword/locatie-geoptimaliseerd | SEO |
| 4 | Zware slider + externe CDN-media, geen zichtbare `width/height` → layout shift | Performance / CWV |
| 5 | Navigatie is diep en deels dubbel (14 losse dienstroutes + submenu's + losse `/remmen-vervangen` buiten `/diensten`) | UX / onderhoud |
| 6 | Twee afspraak-URL-varianten (`/afspraak`, `/afspraak-maken`, `/afspraak-maken/details`) | Consistentie |
| 7 | Reviews over 15 gepagineerde URL's zonder canonical-strategie | SEO (crawl-budget) |
| 8 | Inconsistente hoofd-/kleinletters in tekst ("Bm Carservice", "apk") | Merkconsistentie |

## Bevestigde bedrijfsgegevens
Zie `../README.md` (adres, telefoon, e-mail, openingstijden, kwalificaties).
Openingstijden bevestigd via /contact: **ma–vr 08:30–17:30 (middagpauze), za/zo gesloten**.

## Openstaand (niet verzinnen — TODO klant)
KvK/BTW · echte reviewbron · prijzen tonen ja/nee · endpoint afspraakformulier · transparant logo.
