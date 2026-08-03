# Source Report — Allround Schadeherstel Utrecht (preview)

Dit rapport documenteert de herkomst en verificatie van alle bedrijfsgegevens en
beeldmateriaal in deze preview. Alles is preview-only en niet gedeployed.

## 1. Gebruikte bronnen
- **Aangeleverd Google Maps-profiel** (klant): de door de opdrachtgever verstrekte
  Maps-URL met coördinaten en place-CID.
- **Google Places API (New)** — `places:searchText`, één geverifieerde lookup.
- **Aangeleverd logo**: `assets/original/logo.jpeg` (origineel ongewijzigd bewaard;
  bronbestand door klant aangeleverd als WhatsApp-afbeelding, visueel geverifieerd
  als het Allround-logo: wit voertuigsilhouet + oranje accent + spuitpistool op
  donker antraciet, tekst "ALLROUND SCHADEHERSTEL UTRECHT").
- **Higgsfield** — AI-gegenereerde sfeerbeelden (zie §5).
- **Brand-neutrale technische referentie**: bestaande interne Coders01
  React + Vite + TypeScript + Tailwind previewprojecten zijn uitsluitend read-only
  geraadpleegd voor herbruikbare, merk-neutrale patronen (projectopzet, centrale
  datalaag, toegankelijke navigatie, sticky action bar, JSON-LD, image-optimalisatie
  met sharp). Er zijn geen namen, teksten, kleuren, afbeeldingen of
  bedrijfsgegevens van andere klanten overgenomen.

## 2. Verificatiemethode
Een standalone Python-script (buiten de repository, in een tijdelijke scratchpad)
riep de Places API (New) `searchText` aan met de bestaande
`GOOGLE_MAPS_API_KEY` uit de lokale lead-finder-omgeving. De API-key is nooit
geprint, gelogd of opgeslagen. Het zoekresultaat is hard geverifieerd tegen de
aangeleverde bron:

| Controle | Verwacht (uit Maps-URL) | Places-resultaat | Match |
|---|---|---|---|
| Handelsnaam | Allround Schadeherstel Utrecht | Allround Schadeherstel Utrecht | ✅ exact |
| Coördinaten | 52.0852319, 4.8602122 | 52.0852319, 4.8602122 | ✅ exact |
| CID | 0x29e0da09eafb6da8 (=3017651486470139304) | cid=3017651486470139304 in googleMapsUri | ✅ |
| Place ID | — | ChIJtV9cUaR5xkcRqG376gna4Ck | ✅ (uniek resultaat) |
| Business status | — | OPERATIONAL | ✅ |

Er was **precies één** zoekresultaat; naam + coördinaten + CID komen alle overeen.
De bedrijfsidentiteit is daarmee betrouwbaar vastgesteld.

## 3. Geverifieerde bedrijfsgegevens
- **Handelsnaam:** Allround Schadeherstel Utrecht
- **Place ID:** `ChIJtV9cUaR5xkcRqG376gna4Ck`
- **CID / feature:** `3017651486470139304` (`0x29e0da09eafb6da8`) · feature `/g/11y_36djh4`
- **Adres (werkelijk):** Bierbrouwersweg 15, 3449 HW **Woerden**, Nederland
- **Coördinaten:** 52.0852319, 4.8602122
- **Telefoon:** 06 49402698 (`tel:+31649402698`)
- **Website:** geen (op de vermelding)
- **Rating / reviews:** geen (niet aanwezig op de vermelding)
- **Business status:** OPERATIONAL
- **Openingstijden:** ma–do 08:00–17:00 · vr 08:30–17:00 · za & zo gesloten
- **Google Maps:** https://maps.google.com/?cid=3017651486470139304

## 4. Bronconflicten
- **Plaats vs. handelsnaam:** de handelsnaam bevat "Utrecht", maar het geverifieerde
  fysieke adres ligt in **Woerden**. Conform opdracht is de handelsnaam ongewijzigd
  gehouden, terwijl NAP-gegevens, contact, lokale SEO en JSON-LD de werkelijke plaats
  (Woerden) gebruiken. Dit is geen fout, maar een bewuste keuze; laat de eigenaar dit
  vóór productie bevestigen.
- Geen andere bronnen (bijv. KVK/eigen website) zijn aangeroepen, dus er zijn geen
  verdere adres-/telefoonconflicten vastgesteld. Mochten die later opduiken, dan
  gelden voor deze preview de Places-gegevens als voorlopige NAP-bron.

## 5. Beeldmateriaal en provenance
### Google-foto's
De geverifieerde vermelding bevatte **0 bedrijfsfoto's** (`places.photos` leeg). Er
zijn dus **geen** Place Photo-downloads uitgevoerd en geen Google-beelden gebruikt.

### AI-sfeerbeelden (Higgsfield)
Omdat er geen bruikbare bedrijfsfoto's beschikbaar waren, zijn 6 fotorealistische
**sfeerbeelden** gegenereerd (model: `nano_banana_pro` → backend `nano_banana_2`),
visueel consistent gehouden (moderne NL-werkplaats, donker antraciet, subtiele
oranje accenten, geen zichtbare merken/kentekens/tekst/logo's).

| Bestand (public/images/ai-preview) | Onderwerp | Aspect | Status |
|---|---|---|---|
| hero-werkplaats.webp | Werkplaats + auto-inspectie (hero) | 16:9 | gebruikt |
| autoschade-herstel.webp | Voorbereiding autopaneel | 3:2 | gebruikt |
| motor-scooter-herstel.webp | Motor/scooter herstel | 3:2 | gebruikt |
| boot-herstel.webp | Bootromp herstel | 3:2 | gebruikt |
| vakmanschap-detail.webp | Close-up afwerking | 3:2 | gebruikt |
| b2b-wagenpark.webp | Bedrijfsvoertuigen (B2B) | 3:2 | gebruikt (2e generatie) |

**Uitgesloten:** de eerste B2B-generatie toonde een zichtbaar automerk-embleem op
een grille en een kenteken; deze is verworpen en opnieuw gegenereerd met blanco
grilles en zonder kentekens/emblemen. Alle definitieve beelden zijn visueel
gecontroleerd op vervorming, extra ledematen, leesbare tekst, half gevormde
kentekens en logoachtige symbolen.

Ruwe generator-output staat in `assets/original/higgsfield-preview-raw/` (gitignored).

**AI-disclosure:** De gebruikte werkplaats- en schadeherstelbeelden zijn
AI-gegenereerde sfeerbeelden voor de MVP-preview. Ze tonen niet noodzakelijk de
daadwerkelijke locatie, medewerkers, klanten of uitgevoerde projecten van Allround
Schadeherstel Utrecht. Voor productie moeten deze beelden door de eigenaar worden
goedgekeurd of worden vervangen door originele bedrijfsfoto's. In de UI zijn de
beelden gelabeld als "Sfeerimpressie" en de galerij vermeldt expliciet
"Sfeerimpressie – AI-gegenereerde previewbeelden." Provenance per afbeelding staat
centraal in `rebuild/src/data/gallery.ts`.

## 6. API-requests en kosten
- **1× Places Text Search (New)** met field mask incl. `regularOpeningHours` en
  `photos` (géén `reviews`): ± **$0,035**.
- **0× Place Photo** (geen foto's beschikbaar): $0.
- **Geschat totaal Places: ± €0,03** — ruim binnen het budget van ± €0,20.
- **Higgsfield:** 7 image-generaties × 2 credits = **14 credits** (starter-plan,
  saldo vóór: 150). Geen extra credits gekocht, geen abonnementswijziging.

## 7. Nog door de eigenaar te bevestigen (vóór productie)
- Definitieve keuze/vervanging van alle (AI-)beelden.
- Bevestiging plaats/adres (Woerden) i.c.m. handelsnaam "…Utrecht".
- E-mailadres (niet op de vermelding gevonden).
- Of het telefoonnummer geschikt is voor WhatsApp (nu bewust uitgeschakeld).
- Definitieve dienstenlijst en of "spuit- en lakwerk" volledig gedekt is
  (nu opgenomen op basis van het spuitpistool-element in het logo).
- Rating/reviews: pas tonen wanneer er echte, geverifieerde Google-gegevens zijn.

## 8. Bewust NIET gebruikte claims
Om geen onbewezen beweringen te doen, zijn de volgende claims **niet** opgenomen:
- verzekeringspartner / "erkend door verzekeraars" / rechtstreeks afrekenen met
  iedere verzekeraar;
- certificeringen, garanties, vaste doorlooptijden;
- vervangend vervoer / leenauto;
- gratis diensten;
- aantal jaren ervaring, oprichtingsjaar of familiegeschiedenis;
- SLA's, volumes of vaste levertijden voor B2B;
- een rating of reviewaantal (niet beschikbaar op de vermelding).
