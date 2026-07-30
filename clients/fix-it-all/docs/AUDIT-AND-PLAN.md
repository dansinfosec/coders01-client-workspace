# Autobedrijf Fix-it All — Audit & Implementatieplan

_Datum audit: 2026-07-30 · Bron: live site https://fix-itall.nl (steekproef-crawl via WebFetch + sitemaps)._

> **Status (bijgewerkt 2026-07-30): MVP-frontend gebouwd.** De React + Vite + TypeScript-SPA onder
> `clients/fix-it-all/rebuild/` is functioneel afgerond: home, alle dienstpagina's, occasions
> (overzicht + detail), de 5-staps afspraakflow met RDW-kentekencheck, de 5-staps auto-verkoopmodule
> met foto-upload (compressie + EXIF-strip), en contact/over-ons/vacatures. Afspraak- en
> verkoopmodule draaien op een **vervangbare mock-service** (nog geen backend). Er is nog **niet**
> gecommit, gepusht of gedeployed.
>
> **Fase 0 alsnog uitgevoerd (2026-07-30):** echte crawl via `automation/crawler` + gerichte
> asset-fetch. Verwerkt in de rebuild: het **echte merkrood `#df1f3d`** als basis-kleur (i.p.v. het
> eerdere petrol-palet), het **echte logo** (wit + afgeleide rode variant) en de **echte favicon**,
> plus de echte occasionfoto's. Volledig assetmanifest in `docs/SCRAPED-ASSETS.md`.
>
> **Correctie occasionvoorraad (belangrijk):** §3 hieronder ("2 auto's") is **onjuist gebleken**.
> De live `/occasions/` laadt de voorraad via een **Autodealers.nl-iframe (dealer-id 5359)**, niet via
> WordPress/WooCommerce. De echte voorraad is **25 voertuigen**; alle 25 staan nu met geverifieerde
> specs en **292 echte foto's** in `data/occasions.ts`. Ontdekkingsketen + inventaris:
> **`docs/OCCASION-INVENTORY.md`**. De openstaande klant-TODO's uit §6 blijven staan
> (vectorlogo, werkplaatsfoto's, prijzen bevestigen, reviews, KVK/BTW, WhatsApp).
> Backend (fase 8) volgt ná MVP-akkoord.
>
> Scope-afspraken uit de opdracht, hier vastgelegd zodat ze bewaakt blijven:
> volledig geïsoleerd project onder `clients/fix-it-all/`; **geen** imports of afhankelijkheden
> vanuit BM Carservice (BM is uitsluitend technische kwaliteitsreferentie); nog niet committen,
> pushen of deployen; geen prijzen, garanties of certificeringen verzinnen.

---

## 0. Samenvatting in één alinea

Fix-it All is een onafhankelijke vakgarage in Utrecht (sinds 2000) met vier commerciële motoren:
**APK**, **onderhoud/reparatie**, **uitlaat- & laswerk** en een **occasionsafdeling**. De huidige site is
een verouderd WordPress-thema waar de echte (Nederlandse) content half verdrinkt tussen
**thema-demo-restanten** (Engelse voorbeelddiensten, blogposts over BMW M3/Toyota GT86, een webshop
met winkelwagen). De bedrijfsgegevens zijn eenduidig en betrouwbaar; de dienstteksten zijn bruikbaar
maar dun; de occasionvoorraad is op dit moment **zeer klein (2 auto's)** en deels verouderd.
De rebuild wordt een schaalbare React + Vite SPA met een echte RDW-kentekencheck, een hoogwaardige
afspraakflow en een showroom-waardige occasionsmodule — met een eigen visuele identiteit die
**niet** op BM Carservice lijkt.

---

## 1. Alle bestaande pagina's (uit `sitemap.xml`)

De WordPress-sitemap bevat 5 relevante deel-sitemaps. Ingedeeld naar wat **echt** is versus
**thema-/demo-restant** (belangrijk: veel URL's zijn niet-Nederlandse thema-voorbeelden en horen
**niet** in de rebuild).

### 1a. Echte, relevante pagina's
| URL | Type | In rebuild? |
|---|---|---|
| `/` | Home | ✅ nieuw ontwerp |
| `/apk-keuring/` | Dienst — APK | ✅ dienstpagina |
| `/kleine-beurt/` | Dienst — kleine beurt | ✅ dienstpagina |
| `/grote-beurt/` | Dienst — grote beurt | ✅ dienstpagina |
| `/onderhoud-auto/` | Dienst — onderhoud (overzicht) | ✅ dienst-hub |
| `/uitlaat-lassen-utrecht/` | Dienst — uitlaat/laswerk | ✅ dienstpagina |
| `/uitlaat-kapot-utrecht/` | Dienst — uitlaat (variant/SEO) | 🔁 samenvoegen met uitlaat |
| `/airco-service/` | Dienst — airco | ✅ dienstpagina |
| `/bandenservice/` | Dienst — banden | ✅ dienstpagina |
| `/occasions/` | Occasions overzicht | ✅ occasionsmodule |
| `/occasions/seat-toledo-1-9-tdi-signo-1999/` | Occasion detail | ✅ (data-bron) |
| `/product/volkswagen-polo-1-2-tdi-bluemotion-2011/` | Occasion detail (WooCommerce) | ✅ (data-bron) |
| `/leenscooters/` | Leenvervoer | ➕ als USP/blok, evt. losse pagina |
| `/autos-gezocht/` | Auto inkoop | ➕ "Auto verkopen/inkoop"-pagina |
| `/vacature/` | Vacature | ➕ optioneel (secundair) |
| `/contact/` | Contact | ✅ contactpagina |
| `/apk-aanbieding/`, `/actie/`, `/banden-actie/`, `/apk-keuring-utrecht/`, `/goedkope-apk-utrecht/` | Actie-/SEO-landings | 🔎 zie §7 (lokale SEO-strategie) |

### 1b. SEO-doorway-pagina's (lokaal)
De `page`-sitemap noemt **~160 locatie-specifieke pagina's** (APK / uitlaat / "goedkope apk" per
Nederlandse gemeente). Dit is een klassieke *doorway-page*-strategie. Aanbeveling: **niet 1-op-1
overnemen** (dun, Google-risico). Zie §7 voor een schonere lokale-SEO-aanpak.

### 1c. Thema-/demo-restanten — **uitsluiten**
`/services/engine-overhaul/`, `/services/power-steering/`, `/services/oil-change/`,
`/services/smog-check/`, `/services/tire-balancing/`, `/services/fleet-service/` (Engelse
thema-voorbeelden), `/blog/`, `/shop/`, `/cart/`, `/checkout/`, `/my-account/`, `/gallery/`,
`/werkplaats/`, `/voorbeeld-pagina-2/`, en alle blogposts (`.../2015/08/...`, "hello world",
BMW M3 / GT86 artikelen, station/showcase/transport/logistics/warehousing). **Geen** hiervan is
echte bedrijfscontent.

---

## 2. Alle gevonden diensten

**Betrouwbaar bevestigd, met bruikbare brontekst (eigen dienstpagina aanwezig):**

| Dienst | Kernpunten uit de live site (geverifieerd) |
|---|---|
| **APK-keuring** | RDW-erkende keurmeesters; beoordeelt verkeersveiligheid, milieu en registratie; keuringsrapport met goed/afkeur + reparatieadvies; verwijzing naar RDW-portaal (ovi.rdw.nl) voor vervaldatum. |
| **Kleine beurt** | Olie + oliefilter verversen; diverse vloeistoffen bijvullen; controle uitlaat, remmen, verlichting, banden, ruitenwissers; **20+ controlepunten**. USP's: "altijd de laagste prijs", "altijd snel terecht", "gediplomeerde monteurs". |
| **Grote beurt** | Bougies + motorolie + álle filters; vloeistoffen; **80+ controlepunten** (uitlaat, remmen, verlichting, schokdempers, accu, banden, ruitenwissers). **Actie: gratis APK bij een grote onderhoudsbeurt.** |
| **Onderhoud (overzicht)** | Hub die grote/kleine beurt uitlegt; onderhoudstype hangt af van historie, type, leeftijd, kilometrage. |
| **Uitlaat- & laswerk** | Uitlaat lassen in eigen werkplaats bij lekkage/roest/stootschade; leenfiets tijdens reparatie; klant wordt gebeld als klaar. |
| **Aircoservice** | R134a afzuigen/recyclen; lektest met droge stikstof; bijvullen koudemiddel + compressorolie; interieurfilter controleren/vervangen; advies elke 12 maanden. |
| **Bandenservice** | (De)monteren, balanceren, bandenopslag, bandenreparatie, velgen spuiten, gratis bandenadvies; topmerken. |

**Bevestigd als activiteit maar zónder eigen bronpagina** (bouwen met alleen algemeen-ware,
niet-verzonnen tekst + `TODO: bevestigen met klant`):

- **Algemeen onderhoud / reparatie** — homepage noemt "onderhoud en reparaties … alle merken".
- **Diagnose** — genoemd als "geavanceerde diagnosetechniek"; geen eigen pagina.
- **Auto inkoop** (`/autos-gezocht/`) en **leenvervoer** (leenfiets/leenscooters) — bevestigde
  praktijk, kunnen als ondersteunend blok/USP terugkomen.

> **Prijzen:** nergens op de site gepubliceerd, **behalve** de actie *"gratis APK bij een grote
> beurt"*. Alle overige dienstprijzen blijven leeg met `TODO: bevestigen met klant` — conform de
> workspace-regel om geen prijzen te verzinnen.

---

## 3. Alle gevonden occasions

De occasionvoorraad is **zeer klein en inconsistent opgeslagen** (twee verschillende URL-patronen).
Op dit moment slechts **2 voertuigen** in de sitemaps:

| # | Voertuig | Bouwjaar | Brandstof | Transmissie | Carrosserie | Prijs | Kenteken | Foto's | Bijzonderheden |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **VW Polo 1.2 TDI BlueMotion** | 2011 | Diesel | Handgeschakeld (5) | Hatchback (3-deurs, 5 zits) | **€ 6.450** | 78-RZR-1 | 7 (IMG_1841–1849) | 1199 cc, 3-cil, Euro 5, grijs, stof zwart interieur, airco. Km-stand niet vermeld. |
| 2 | **Seat Toledo 1.9 TDI Signo** | 1999 (juni) | Diesel | Handgeschakeld | Sedan (4-deurs, 5 zits) | **op aanvraag** | ZL-SG-04 | meerdere | 1896 cc, 81 kW/110 pk, margeauto, "lichte schade rechts, kan in overleg gerepareerd". Km "op aanvraag". |

**Waarnemingen (bepalen het ontwerp van de module):**
- Inventaris is klein en deels verouderd → de module **moet uitblinken bij weinig én nul auto's**
  (hoogwaardige lege staat, geen loze filters).
- Twee URL-patronen (`/occasions/<slug>/` én `/product/<slug>/`) → rebuild **standaardiseert** op
  `/occasions/:slug`.
- De detaildata bevat veel bruikbare specs (RDW-achtig). Km-stand ontbreekt soms → veld optioneel
  met nette weergave ("op aanvraag").
- Statussen uit de opdracht (nieuw binnen / beschikbaar / gereserveerd / verkocht / binnenkort) zijn
  **niet** in de brondata aanwezig → per auto een `status`-veld dat de klant later zet; default
  `beschikbaar`.

---

## 4. Beschikbare bedrijfsgegevens (geverifieerd)

| Gegeven | Waarde | Bron |
|---|---|---|
| Naam | **Autobedrijf Fix-it All** (wordmark: "FIX-IT ALL") | site-breed |
| Adres | **Eendrachtlaan 242, 3526 LB Utrecht** | contact + APK |
| Telefoon | **030 – 214 84 88** (`030 2148488`) | site-breed |
| Mobiel | **06-42104745** | occasion-detail Seat |
| E-mail | **info@fix-itall.nl** | contact |
| Openingstijden | **Ma–Vr 08:30–18:00 · Za 08:30–17:00 · Zo gesloten** | contact/APK |
| Opgericht | **2000** ("sinds 2000") | home |
| Propositie | "Service en kwaliteit voor een betaalbare prijs" · "Uw pitstop voor autokeuring, onderhoud en occasions" | home/onderhoud |
| USP's | Alle merken · persoonlijke aandacht & eerlijk advies · investeert in nieuwste technieken · leenfiets/leenscooter | home + diensten |
| Actie | **Gratis APK bij een grote onderhoudsbeurt** | meerdere pagina's |
| Social | Facebook: `facebook.com/fix.it.all.utrecht/` | header/footer |

**Te verifiëren (niet als feit gebruiken tot bevestigd):**
- "Google 4.7 sterren" staat op de eigen site — **claim, geen bewijs**. Niet als reviewscore tonen
  zonder bron/bevestiging (workspace-regel: geen verzonnen reviews). `TODO: bevestigen + reviewbron.`
- KVK-nummer, BTW-nummer: **niet** op de site. `TODO: bevestigen met klant.`
- WhatsApp: mobiel `06-42104745` bestaat, maar of dit een WhatsApp-kanaal is → `TODO bevestigen`
  (occasions-detail vraagt om een WhatsApp-knop).

---

## 5. Beschikbare afbeeldingen en assets

- **Logo:** `wp-content/uploads/2016/03/wit-transpartant-140-2.png` (+ sticky-variant). Dit is een
  **wit, transparant** logo → werkt alleen op donkere achtergrond. We hebben óók een donkere/mono
  variant nodig voor lichte secties, favicon en OG-image. `TODO: origineel/vector logo opvragen bij
  klant`, anders zelf een nette monochrome afgeleide maken.
- **Occasion-foto's:** VW Polo heeft **7 eigen foto's** (IMG_1841–1849, WordPress media). Seat Toledo
  heeft meerdere. Dit zijn **echte, bruikbare** foto's — alleen deze gebruiken (geen stockauto's).
- **Dienst-/sfeerbeelden:** het thema gebruikt grotendeels demo-/stockbeeld → **niet** overnemen.
  We hebben echte werkplaats-/gevelfoto's nodig. `TODO: fotomateriaal opvragen`; tot die tijd
  tekst-/patroon-gedreven hero's (geen nep-stockmonteur).
- **Aanpak:** een echte crawl met `automation/crawler` + `automation/image-downloader` in
  **fase 0** archiveert `scraped/` + `assets/` (originele paden behouden voor remapping),
  met respect voor `robots.txt` en rate limits (`docs/SCRAPING-POLICY.md`).

---

## 6. Ontbrekende gegevens (openstaand bij klant)

1. **Prijzen** van diensten (alleen "gratis APK bij grote beurt" is bevestigd).
2. **Km-stand** VW Polo; volledige specs/omschrijving van beide occasions; actuele voorraad.
3. **Occasionstatussen** (nieuw binnen/gereserveerd/verkocht/binnenkort) — wie beheert die en hoe.
4. **Reviews/beoordeling** — echte bron voor "4.7" of weglaten.
5. **KVK, BTW, statutaire naam** (nodig voor footer + LocalBusiness schema).
6. **WhatsApp-nummer** (ja/nee + welk nummer).
7. **Certificeringen/garanties** — géén op de site; **niets verzinnen** (bv. geen "X maanden
   garantie" tenzij bevestigd).
8. **Origineel logo (vector) + echt fotomateriaal** werkplaats/team/gevel.
9. **Diensten-scope**: is er ook aircovulling voor R1234yf, distributieriem, remmen als aparte
   diensten? (nu niet als pagina aanwezig).
10. **Lokale SEO-intentie**: welke plaatsen/wijken zijn commercieel relevant (i.p.v. 160 doorways).

---

## 7. Voorgestelde routes (informatie-architectuur)

```
/                                  Home
/diensten                          Dienstenoverzicht (hub)
/diensten/apk-keuring              Dienst — APK
/diensten/kleine-beurt             Dienst — kleine onderhoudsbeurt
/diensten/grote-beurt              Dienst — grote onderhoudsbeurt
/diensten/onderhoud                Dienst — algemeen onderhoud
/diensten/diagnose                 Dienst — diagnose            (algemene tekst + TODO)
/diensten/reparatie                Dienst — reparatie           (algemene tekst + TODO)
/diensten/uitlaat-laswerk          Dienst — uitlaat & laswerk
/diensten/airco-service            Dienst — aircoservice
/diensten/bandenservice            Dienst — bandenservice
/occasions                         Occasions overzicht (filters, zoek, galerij/lijst)
/occasions/:slug                   Occasion detail
/afspraak                          Afspraak- & planningsflow (5 stappen)
/auto-verkopen                     Auto verkopen — aanmeldflow (5 stappen) → zie §12
/contact                           Contact
/vacatures                         Vacature (optioneel, secundair)
*                                  404
/api/rdw                           Interne RDW-proxyroute (serverless)
```

**Redirects (SEO-behoud):** oude URL's 301 → nieuw:
`/apk-keuring/` → `/diensten/apk-keuring`, `/kleine-beurt/` → `/diensten/kleine-beurt`,
`/grote-beurt/` → `/diensten/grote-beurt`, `/onderhoud-auto/` → `/diensten/onderhoud`,
`/uitlaat-lassen-utrecht/` + `/uitlaat-kapot-utrecht/` → `/diensten/uitlaat-laswerk`,
`/airco-service/` → `/diensten/airco-service`, `/bandenservice/` → `/diensten/bandenservice`,
`/product/<slug>/` → `/occasions/<slug>`. (Config in `vercel.json` / host-redirects.)

**Lokale SEO i.p.v. 160 doorways:** één sterke APK-pagina met echte Utrecht-signalen
(adres, LocalBusiness + GeoCoordinates schema, "APK Utrecht" natuurlijk in de tekst) plus optioneel
een **schaalbaar** `/apk/:plaats`-template later, gevoed door centrale data — alleen voor een
kort lijstje écht relevante plaatsen, met unieke content per plaats. Niet in MVP-scope tenzij
gewenst.

---

## 8. Component- en data-architectuur

**Stack:** React 18 + Vite + TypeScript (strict) + React Router + Tailwind + react-helmet-async
(SEO) + react-hook-form + zod (formulieren). Eigen, vers geschreven code — **geen** BM-import.
_(BM gebruikt exact deze stack; wij hanteren dezelfde kwaliteitslat, eigen implementatie.)_

```
clients/fix-it-all/rebuild/
├─ api/
│  └─ rdw.ts|js                 Interne RDW-proxy (serverless): caching, rate-limit, foutafhandeling
├─ src/
│  ├─ data/                     Centrale, configureerbare content (single source of truth)
│  │  ├─ company.ts             Bedrijfsgegevens (geverifieerd + TODO's), openingstijden
│  │  ├─ services.ts            Diensten (dienstpagina-content, FAQ, interne links)
│  │  ├─ werkzaamheden.ts       Boekbare werkzaamheden + duur (voedt afspraak + kalender)
│  │  ├─ occasions.ts           Lokale gestructureerde occasiondata (MVP-databron)
│  │  └─ navigation.ts          Navigatiestructuur (desktop dropdown + mobiel)
│  ├─ services/                 Vervangbare service-laag (frontend ↔ toekomstige backend)
│  │  ├─ occasionService.ts     getOccasions(filters) / getOccasionBySlug(slug) / getSimilar(...)
│  │  ├─ planningService.ts     getAvailableDates / getAvailableTimeSlots / createAppointment
│  │  ├─ rdwService.ts          lookupKenteken(kenteken) → genormaliseerd voertuig (via /api/rdw)
│  │  └─ vehicleSaleService.ts  submitVehicleSaleLead / uploadVehicleSalePhotos / getVehicleSaleLead  (§12)
│  ├─ components/
│  │  ├─ layout/                Header, DesktopNav (dropdown), MobileNav (drawer), Footer
│  │  ├─ afspraak/              Stap 1–5, kalender, tijdsloten, kentekencheck, voortgang
│  │  ├─ occasions/             Kaart, filterbalk, galerij/lijst-toggle, galerij, statuspill
│  │  ├─ sections/              Hero, USP's, dienst-teasers, CTA, openingsstrook, kaart
│  │  └─ ui/                    Button, Container, Section, Tag, Breadcrumb, Skeleton …
│  ├─ hooks/                    useLockBodyScroll, useFocusTrap, useQueryFilters, useReveal
│  ├─ lib/                      kenteken (format/validatie), rdw-normalisatie, openingHours, seo
│  ├─ pages/                    Route-componenten (zie §7)
│  └─ routes/                   Router + padconstanten
└─ docs/
   ├─ OCCASION_BACKEND_MIGRATION.md   Migratie lokale data → GET /api/occasions/ (verplicht deliverable)
   └─ VEHICLE_SALE_BACKEND.md         Auto-verkopen: mock-service → Django/DRF-backend (§12, verplicht deliverable)
```

**Kernprincipes:**
- **Componenten praten nooit rechtstreeks met de databron.** `src/data/occasions.ts` is de tijdelijke
  bron; componenten gebruiken uitsluitend `occasionService.ts`. Later wisselen we de service-implementatie
  om naar `GET /api/occasions/` + `GET /api/occasions/:slug/` **zonder** componentwijzigingen.
- **Planning = vervangbare service** met exact de gevraagde signatures
  (`getAvailableDates`, `getAvailableTimeSlots`, `createAppointment`); MVP gebruikt centrale demo-data
  en labelt duidelijk *"beschikbaarheid is nog geen live werkplaatsagenda"*. Architectuur voorbereid op
  backend / Google Calendar / Outlook / garageplanning.
- **RDW-check via interne proxyroute** `/api/rdw?kenteken=…`: kenteken, km-stand (invoer), merk,
  handelsbenaming, brandstof, voertuigsoort, APK-vervaldatum; met loading, foutafhandeling en caching.
- **SEO per pagina**: unieke `<title>`/meta + relevante structured data (LocalBusiness/AutoRepair,
  Service, FAQPage, Vehicle/Car voor occasions, BreadcrumbList).

---

## 9. Implementatiefases

| Fase | Inhoud | Resultaat |
|---|---|---|
| **0 — Crawl & assets** | `automation/crawler` + `image-downloader`: echte pagina's + occasion-foto's + logo naar `scraped/`/`assets/`. Bevestigde feiten vastleggen in `client.md`. | Volledige, offline brondata. |
| **1 — Scaffold & fundament** | Vite+TS project in `rebuild/`, Tailwind-tokens (nieuwe identiteit, §11), routing, layout (header/footer), `company.ts`, SEO-basis, 404. | Skelet dat draait + lint/tsc/build groen. |
| **2 — Navigatie (desktop + mobiel)** | Sticky header, Diensten-dropdown, Occasions-hoofditem, afspraak-CTA; mobiele drawer met focus-trap, scroll-lock, Escape, sluit-na-navigatie; geen overflow vanaf 320px. | Toegankelijke navigatie op alle breekpunten. |
| **3 — Diensten** | Dienst-hub + individuele dienstpagina's met de vaste bouwstenen (H1, uitleg, voordelen, werkwijze, FAQ, interne links, afspraak-/contact-CTA, unieke metadata, structured data). | Alle bevestigde diensten live. |
| **4 — Occasionsmodule** | `occasions.ts` + `occasionService.ts`; overzicht met zoek/filters/sortering/galerij+lijst/URL-params/paginering/lege staat; detail met galerij, specs, CTA's (bel/WhatsApp/proefrit), vergelijkbare auto's, breadcrumb, Vehicle-schema. + `OCCASION_BACKEND_MIGRATION.md`. | Showroom-waardige occasions. |
| **5 — Afspraak & RDW** | `/api/rdw`-proxy + `rdwService`; 5-staps flow met kalender (dagstatussen, maandnavigatie, NL-notatie, tijdsloten, duur per werkzaamheid, statusbehoud); `planningService` met demo-data + duidelijke disclaimer. | Werkende, eerlijke afspraakflow. |
| **6 — Auto verkopen (mock)** | `/auto-verkopen` 5-staps aanmeldflow; RDW-hergebruik; foto-upload (compressie, EXIF-strip, previews, voortgang, retry); `vehicleSaleService` (mock); plaatsing in nav/home/occasions/detail/footer; `VEHICLE_SALE_BACKEND.md`. **Geen prijsbeloftes.** Zie §12. | Werkende aanmeldmodule (mock). |
| **7 — Home + lokale SEO + polish** | Home die alle motoren bindt; structured data compleet; performance (image-sizes, lazy, code-split), a11y-audit, reduced-motion; test op 320/375/390/430/desktop. | Oplever-klare MVP. |
| **8 — Backend (apart, ná MVP-akkoord)** | Django + DRF + PostgreSQL + R2 + transactionele e-mail voor Auto verkopen; Django Admin voor Ali; service-laag omzetten van mock → echte API. Zie §12. | Productie-lead-intake. |

_Elke fase: `npm run lint --max-warnings 0`, `tsc --noEmit`, productie-build en echte browsertest
voordat die als "klaar" geldt. Committen/pushen/deployen pas op expliciete instructie._

---

## 10. Risico's en openstaande beslissingen

| # | Risico / beslissing | Impact | Voorstel |
|---|---|---|---|
| R1 | **Occasionvoorraad is nu 2 auto's** (deels 1999, "op aanvraag") | Module oogt leeg | Module ontwerpen voor klein/nul-aanbod; hoogwaardige lege staat; km/prijs optioneel; klant vragen om actuele voorraad. |
| R2 | **Geen gepubliceerde prijzen** | Dienstpagina's zonder prijs | "Op aanvraag" + duidelijke CTA; alleen bevestigde actie (gratis APK) tonen; `TODO`-prijzen. |
| R3 | **160 SEO-doorway-pagina's** repliceren | Google-kwaliteitsrisico + veel dunne pagina's | Niet overnemen; één sterke APK-pagina + optioneel schaalbaar `/apk/:plaats`-template met unieke content. |
| R4 | **Reviewclaim "4.7"** zonder bron | Regel: geen verzonnen reviews | Niet tonen tot bevestigde bron; anders weglaten. |
| R5 | **Logo alleen wit/transparant** | Slecht op lichte UI + favicon/OG | Vector opvragen; tussentijds nette monochrome afgeleide. |
| R6 | **Afspraak/planning is mock** | Verwachtingsmanagement | Overal labelen *"nog geen live agenda"*; service met echte signatures zodat backend later inplugt. |
| R7 | **RDW Open Data** velddekking/uptime | Kentekencheck kan falen | Proxy met caching + timeout + nette foutafhandeling; handmatige invoer als fallback. |
| R8 | **WhatsApp/KVK/BTW onbekend** | Detailpagina-CTA & footer/schema incompleet | `TODO`-velden; UI verbergt netjes wat ontbreekt (geen loze knoppen). |
| R9 | **Diagnose/reparatie zonder brontekst** | Risico op verzonnen content | Alleen algemeen-ware, niet-specifieke tekst + `TODO: bevestigen`; geen verzonnen procedures/prijzen. |
| R10 | **Crawl-autorisatie & robots.txt** | Scraping-policy | Alleen deze klant-site; `robots.txt` + rate limits respecteren; data binnen `clients/fix-it-all/`. |

---

## 11. Designrichting (frontend-design methode) — bewust géén BM-kopie

**Subject → richting.** Fix-it All = Utrechtse allround vakgarage sinds 2000, met twee gezichten:
**werkplaats** (APK/onderhoud/uitlaat) én **showroom** (occasions). Kernactie: kenteken invoeren →
afspraak of auto vinden. De identiteit put uit die eigen wereld: **pitstop-precisie + het Nederlandse
kenteken**.

**Bewuste divergentie van BM Carservice** (BM = signaalgeel #FFD100 + antraciet + diagonale
hazard-streep + Archivo/IBM Plex). Fix-it All vermijdt dat volledig: **geen** geel-als-vlakkleur,
**geen** hazard-strepen, **ander** typografisch systeem.

| Laag | Keuze voor Fix-it All | Waarom onderscheidend |
|---|---|---|
| **Kleur** | `asphalt` #16181D · `steel` #5B6470 · `paper` #F5F3EF · **`petrol` #0C6E6A** (merk-accent, diep teal) · `torque` #F26B1D (alléén functionele energie/"nieuw binnen") + statuskleuren occasions | Diep petrol-teal is premium-automotive en botst niet met BM-rood/geel, noch met de AI-clichés (cream+serif / zwart+acid-green / broadsheet). |
| **Typografie** | Display **Bricolage Grotesque** · Body **Inter** · Data/specs **Geist Mono** (of JetBrains Mono) | Ander systeem dan BM's Archivo/IBM Plex; grotesk i.p.v. serif (dus geen cream+serif-default). |
| **Signature** | De **kenteken-plaat** als terugkerend functioneel element: de RDW-kentekeninvoer ís een echte NL-plaat (blauwe NL-band, zwarte tekens), en occasions tonen hun plaat. | Subject-echt (kentekencheck + occasions), functioneel, en totaal anders dan BM's hazard-divider. Geel leeft **alleen** binnen de plaat, nergens anders → geen BM-botsing. |
| **Hero** | Levende module i.p.v. template-hero: kop + **directe kentekencheck** ("Voer uw kenteken in — wij regelen APK, onderhoud of uw occasion"). | Toont meteen de kernactie; geen stockmonteur, geen groot-getal-cliché. |
| **Occasions** | Showroom-gevoel: grote fotokaarten, rustige specs in mono, statuspill; galerij-detail met grote hoofdfoto + thumbnails. | Occasions als volwaardig hoofdonderdeel, niet "kaartjespagina". |

**Kwaliteitsvloer:** responsive t/m 320px · zichtbare toetsenbord-focus · `prefers-reduced-motion` ·
expliciete afbeeldingsafmetingen (CWV) · ingetogen motion (één page-load reveal + hover-microinteracties).

---

## 12. Auto verkopen-module (nieuw hoofdonderdeel)

Route **`/auto-verkopen`**. Doel: particuliere én zakelijke klanten melden hun auto aan; **Ali**
beoordeelt handmatig en belt terug voor een **vrijblijvend bod**.

**Harde regel — geen prijsbeloftes.** Nooit: direct/gegarandeerd bod · automatisch berekende waarde ·
"hoogste prijs" · "bod binnen X minuten" · gegarandeerde aankoop. Een reactietermijn tonen we
**alleen** als Ali die zelf bevestigt (`TODO`). Primaire CTA: **"Vraag een vrijblijvend bod aan"**.
Ondersteunend: *"Meld uw auto aan. Wij bekijken de gegevens en nemen persoonlijk contact met u op."*

**Plaatsing:** hoofdnavigatie · homepage · occasionspagina · relevante occasion-detailpagina's · footer.

**5-staps flow** (invoer bewaard tussen stappen én bij refresh):
1. **Voertuig** — NL-kenteken + km-stand; RDW-hergebruik (`rdwService`) haalt merk, handelsbenaming,
   brandstof, voertuigsoort, datum eerste toelating, APK-vervaldatum; overzichtskaart + *"Is dit uw
   auto?"*; fallback *"Ik weet mijn kenteken niet"* → handmatig merk/model/uitvoering/bouwjaar.
2. **Staat & onderhoud** — begrijpelijke keuzekaarten (geen lange dropdowns): transmissie, aantal
   sleutels, onderhoudshistorie (volledig/gedeeltelijk/geen), onderhoudsboekje, rijdt de auto,
   waarschuwingslampjes, technische gebreken, zichtbare schade, schadeverleden, interieur, banden,
   datum laatste onderhoud, gewenste verkooptermijn, **optionele** minimale prijsverwachting, vrije
   toelichting. Bij schade/gebrek → verplicht tekstveld *"Beschrijf de schade of het gebrek…"*.
3. **Foto's** — gewenste hoeken met voorbeeldkaartjes (links/rechtsvoor, links/rechtsachter,
   interieur, dashboard, kilometerteller, schade). Camera/bibliotheek + drag-and-drop, multi-upload,
   previews, verwijderen, voortgang, retry; max. aantal + max. bestandsgrootte; JPG/PNG/WebP/HEIC
   (HEIC evt. server-side converteren); mobiele foto's client-side comprimeren; **EXIF-locatie
   strippen**. **Min. 5 algemene foto's** voor een complete aanvraag; anders verzenden mag, gemarkeerd
   *"Foto's ontbreken — telefonisch opvolgen"*. Geen nauwkeurig bod beloven bij te weinig foto's.
4. **Contact** — naam, telefoon (**verplicht**), e-mail, postcode, woonplaats, particulier/zakelijk,
   belvoorkeur (ochtend/middag/avond/geen), optioneel WhatsApp. Verplichte privacytoestemming
   (letterlijk uit de opdracht). **Geen** automatische marketingtoestemming.
5. **Controle & verzenden** — volledige samenvatting (voertuig, km, staat, onderhoud, schade, #foto's,
   contact); elke sectie los aanpasbaar. Na verzenden: *"Bedankt voor uw aanvraag — Ali bekijkt uw
   voertuiggegevens en neemt persoonlijk contact met u op… U bent nergens toe verplicht."* + bevestigingsmail.

**Service-laag (vervangbaar, MVP = mock):** `submitVehicleSaleLead(payload)` ·
`uploadVehicleSalePhotos(files)` · `getVehicleSaleLead(referenceNumber)`. Mockdata + uploadsimulatie
centraal. In de demo **niet** doen alsof er echt is opgeslagen. Migratie → `docs/VEHICLE_SALE_BACKEND.md`.

**Productiebackend (fase 8, ná MVP):** Django + DRF + PostgreSQL + externe object-storage (bv.
Cloudflare R2) + transactionele e-mail. Foto's **niet** permanent op Vercel/Render-fs. Modellen:
`VehicleSaleLead` (id, referenceNumber, status, RDW-data, mileage, vehicleCondition, maintenanceHistory,
damageDescription, expectedPrice, saleTiming, customerName, phone, email, postcode, city, customerType,
preferredContactMoment, consentTimestamp, source, createdAt, updatedAt), `VehicleSalePhoto`,
`VehicleSaleNote`. Statussen: nieuw · foto's ontbreken · te beoordelen · contact opgenomen · bod
uitgebracht · afspraak gepland · geaccepteerd · afgewezen · ingetrokken · afgerond.
**Beheer (Django Admin)** voor Ali: aanvragen bekijken/zoeken/filteren/exporteren, alle voertuig- en
foto-gegevens, klikbaar telefoonnummer, interne notities, status wijzigen, **intern bodbedrag**
(nooit klantzichtbaar), datum telefonisch contact. Geen automatische taxatiemodule.
**Meldingen:** Ali krijgt e-mail met referentienummer + voertuig/km/telefoon/#foto's + beveiligde
admin-link; klant krijgt ontvangstbevestiging. Foto's als **beveiligde links**, geen zware bijlagen.
**Veiligheid/privacy:** bestandstypecontrole front+back, max. grootte, rate limiting, spam-/malware-
controle waar mogelijk, unieke bestandsnamen, geen public directory listing, tijdelijke beveiligde
image-URL's, verwijderbeleid, privacyverklaring met bewaartermijn, **geen kenteken/klantdata in
publieke URL's**.

---

## 13. Wat ik nu van je nodig heb (goedkeuring)

1. **Akkoord op de scope & routes** (§7) — met name: diensten-set, occasions-URL-standaardisatie,
   en de lokale-SEO-keuze (géén 160 doorways).
2. **Akkoord op de designrichting** (§11) — petrol/graphite + kenteken-plaat-signature, of wil je
   een andere hoek?
3. **Antwoord op de `TODO`-punten** (§6) waar mogelijk — vooral: actuele occasionvoorraad, WhatsApp
   ja/nee, KVK/BTW, en of we "4.7" mogen tonen.
4. **Bevestiging dat ik met fase 0 (crawl + assets) mag starten** zodra bovenstaande akkoord is.

> Er is nog **niets gebouwd, gecommit of gedeployed**. Ik wacht op je akkoord voordat ik verder ga.
