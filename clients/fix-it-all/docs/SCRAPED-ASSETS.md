# Fix-it All — Scraped assets & merkgegevens (fase 0)

_Crawl uitgevoerd: 2026-07-30 · Tools: `automation/crawler` (pagina's) + directe,
polite fetch voor theme-CSS en occasion-detailpagina's + `Pillow` (optimalisatie)._
_Bron: live site https://fix-itall.nl · alleen deze klant-site, conform `docs/SCRAPING-POLICY.md`._

Rauwe crawl-output staat in `clients/fix-it-all/scraped/` (pages/, theme/, index.json,
crawl-report.json). Klant-eigen assets zijn gedownload naar
`clients/fix-it-all/rebuild/public/assets/`.

---

## 1. Gecrawlde pagina's (15 succesvol, 0 errors)

| URL | Type | Gebruikt voor |
|---|---|---|
| `/` | Home | Bedrijfsgegevens, logo, merkkleur |
| `/apk-keuring` | Dienst | Bevestiging dienstcontent |
| `/onderhoud-auto` | Dienst (hub) | Bevestiging dienstcontent |
| `/uitlaat-lassen-utrecht` | Dienst | Bevestiging dienstcontent |
| `/occasions` | Occasions-overzicht | Laadt de voorraad via iframe → **Autodealers.nl-plugin (did=5359)**; zie occasion-audit hieronder |
| `/contact` | Contact | E-mail bevestigd (`info@fix-itall.nl`) |
| `/vacature` | Vacature | Bevestiging |

> **Correctie t.o.v. eerdere aanname (belangrijk):** de live occasionvoorraad is **niet** 2
> auto's maar **25**. De `/occasions/`-pagina rendert een iframe
> `svl.autodealers.nl/occasions.aspx?did=5359`; WooCommerce/sitemap tonen slechts 1 legacy-product.
> Volledige ontdekkingsketen + inventaris: **`docs/OCCASION-INVENTORY.md`**.

Overgeslagen (off-domain, correct): Facebook, Google Maps/reviews, ovi.rdw.nl.
Niet aangetroffen als crawlbare links: de losse dienstpagina's `kleine-beurt`,
`grote-beurt`, `airco-service`, `bandenservice` (bestaan volgens sitemap maar niet
gelinkt in de gecrawlde set) en de ~160 SEO-doorway-pagina's (bewust niet nagejaagd).

## 2. Merkkleuren (geverifieerd uit `themes/garage/assets/css/custom-style.css`)

| Rol | Hex | Frequentie in theme-CSS | Verwerkt in rebuild |
|---|---|---|---|
| **Primair merkrood** | `#df1f3d` | 127× (dominant) | `--petrol` → `351 76% 50%` |
| Donkerder rood | `#b21931` | 2× | `--petrol-strong` → `350 75% 40%` |
| Lichter rood (accent) | `#e33550` / `#e63950` | 1× | `--torque` → `352 78% 56%` |
| Grafiet-donker | `#0e2a36` / `#111` / `#333` | meerdere | behouden `--asphalt` (near-black) |
| Wit | `#ffffff` | — | `--paper` (behouden) |

> De oorspronkelijke rebuild gebruikte een petrol/teal-palet (bewust "nieuwe identiteit").
> Conform de opdracht is dit **omgezet naar het echte merkrood** als basis, met behoud van
> de moderne layout, grafiet-donkere secties en de kentekenplaat-signature. Token-namen
> (`petrol`, `torque`) zijn behouden om bestaande classes niet te breken; alleen de
> HSL-waarden zijn aangepast. `theme-color` (index.html) staat nu op `#df1f3d`.

## 3. Gedownloade assets

| Asset | Originele URL | Lokaal pad | Type | Gekoppeld aan | Status | Toelichting |
|---|---|---|---|---|---|---|
| Logo (wit/transp.) | `…/2016/03/wit-transpartant-140-2.png` | `public/assets/brand/fix-it-all-logo-wit.png` (139×49) | logo | site-breed | **In gebruik** | Op donkere achtergrond (footer, mobiel menu) |
| Logo (rood, afgeleid) | — (afgeleid uit wit-logo, ingekleurd `#df1f3d`) | `public/assets/brand/fix-it-all-logo-rood.png` | logo | site-breed | **In gebruik** | Op lichte achtergrond (header). Origineel is wit-only; rode variant nodig voor lichte UI |
| Logo sticky (wit) | `…/2016/03/wit-transpartant-sticky.png` | `public/assets/brand/fix-it-all-logo-wit-sticky.png` (1326 b) | logo | — | Reserve | Eén logo volstaat in de rebuild-header |
| Favicon | `…/2016/03/favicon.png` (160×160) | `public/favicon.png` + `public/assets/brand/fix-it-all-favicon.png` | favicon | site | **In gebruik** | Vervangt de placeholder-`favicon.svg` (verwijderd) |
| Favicon 100 | `…/2016/03/favicon-100x100.png` | `public/assets/brand/fix-it-all-favicon-100.png` | favicon | — | Reserve | Extra maat, niet nodig |
| **Occasionfoto's (25 voertuigen)** | `media-cdn.vwe.nl/Images/<id>` (Autodealers.nl-voorraad, did=5359) | `public/assets/occasions/<slug>/<slug>-NN.jpg` | occasionfoto | Alle 25 occasions in `data/occasions.ts` | **In gebruik** | **292 foto's** gedownload (0 fouten), geoptimaliseerd naar max 1400px JPEG q80 progressive. Zie `docs/OCCASION-INVENTORY.md` voor de mapping per voertuig |

## 4. Dienst-/hero-afbeeldingen — onderzocht, geen bruikbare klantassets

De volledige beeldinventaris van de site is doorzocht (52 ruwe image-refs over 15 pagina's,
via `automation/image-downloader --dry-run`). Bevinding: er zijn **geen eigen dienstfoto's**
(geen `apk.jpg`/`onderhoud.jpg`-achtige beelden) en **geen echte werkplaats-/teamfoto's**.
De enige niet-occasion beelden zijn:

| Bestand | Wat het is | Besluit |
|---|---|---|
| `2016/03/homepage_slider_04.jpg` (1600×780) | **Generieke stockfoto** (monteur bij motorblok, geen Fix-it All-locatie/team) | **Niet gebruikt** — conform beleid geen "nep-stockmonteur". Gearchiveerd als `assets/reference/homepage-slider-STOCK-niet-gebruikt.jpg`. |
| `2012/07/rdw_erkend_bedrijf.jpg` (314×179) | **RDW-erkend-bedrijf badge** (merk van derden) | **Niet ingebouwd** — logo van derden; de RDW-erkenning staat al als geverifieerde tekst-USP in de rebuild. Gearchiveerd als `assets/reference/rdw-erkend-badge-derden.jpg`. |

De dienstpagina's blijven daarom tekst-/patroongedreven (icoon + content), zonder stockbeeld.
`TODO: echte werkplaats-/gevel-/teamfoto's opvragen bij klant` → dan koppelen in
`public/assets/services/` en `public/assets/general/`.

## 5. Occasion-voorraad & robots.txt-notitie (transparantie)

- **25 voertuigen** met **292 foto's** zijn gearchiveerd en gekoppeld (zie
  `docs/OCCASION-INVENTORY.md`). De eerdere "Seat Toledo zonder foto's" is achterhaald: de foto's
  komen niet uit de WordPress-media maar uit de Autodealers.nl-voorraadfeed.
- **robots.txt-nuance (op de record):** de voorraad-vendorhosts zijn geen eigen klantdomein.
  `svl.autodealers.nl/robots.txt` blokkeert alleen specifieke AI/SEO-bots (SemrushBot, GPTBot,
  Claude-Web, CCBot, …) en heeft **geen** `User-agent: *`-regel → de pagina-fetches met onze eigen
  crawler-UA vielen buiten die uitsluitingen. De beeld-CDN `media-cdn.vwe.nl/robots.txt` zet echter
  `User-agent: * Disallow: /` (alleen `facebookexternalhit` mag `/Images/`). De foto's zijn de
  **eigen listinginhoud van de klant** (hun dealer-account 5359, getoond op hun eigen site) en zijn
  op expliciete opdracht gedownload voor de site-rebuild, rate-limited en met eerlijke UA. **Advies:**
  laat de klant de beeldrechten/gebruiksvoorwaarden met Autodealers.nl/VWE bevestigen, of lever de
  foto's rechtstreeks aan; dan is dit punt volledig dichtgetimmerd.
- **Origineel vectorlogo** — alleen een wit rasterlogo (139×49) beschikbaar. Voor scherpe
  weergave op groot formaat en een echte lichte variant: `TODO: vector/origineel opvragen`.

## 6. Overige bevindingen

- **Google-listing bestaat** (Maps CID `17207788852658196379`, place-id
  `ChIJ77J1V-llxkcRm0-ebMpYzu4`) met meerdere reviewers. De claim "4.7" op de eigen site is
  hiermee **niet** als exacte score geverifieerd → geen reviewscore tonen tot bevestigd
  (workspace-regel: geen verzonnen reviews).
- **WhatsApp**: geen `wa.me`-link op de site aangetroffen; het mobiele nummer `06-42104745`
  blijft provisioneel (zie `data/company.ts`, `TODO`).
- Openstaande klant-TODO's uit `AUDIT-AND-PLAN.md` §6 blijven staan.
