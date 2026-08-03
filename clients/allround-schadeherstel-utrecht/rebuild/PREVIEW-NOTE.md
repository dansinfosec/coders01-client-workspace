# Preview Note — Allround Schadeherstel Utrecht

Dit is een **frontend-only MVP-preview**. Het is niet gedeployed en niet gecommit.
Onderstaande punten moeten vóór productie worden geregeld.

## Preview-only status
- Lokale salespreview: `npm run dev` of `npm run build` + `npm run preview`.
- Geen backend, geen analytics, geen cookies/third-party embeds.
- Geen productie-deployment.

## Beeldmateriaal (belangrijk)
> De gebruikte werkplaats- en schadeherstelbeelden zijn **AI-gegenereerde
> sfeerbeelden** voor de MVP-preview. Ze tonen niet noodzakelijk de daadwerkelijke
> locatie, medewerkers, klanten of uitgevoerde projecten van Allround Schadeherstel
> Utrecht. Voor productie moeten deze beelden door de eigenaar worden goedgekeurd of
> worden vervangen door originele bedrijfsfoto's.

- In de UI gelabeld als "Sfeerimpressie"; de galerij toont
  "Sfeerimpressie – AI-gegenereerde previewbeelden."
- De geverifieerde Google-vermelding bevatte **geen** bedrijfsfoto's; er zijn geen
  Google-beelden gebruikt.
- Provenance per afbeelding: `src/data/gallery.ts` (`type`, `attribution`, `source`,
  `previewOnly`).
- **Owner-goedkeuring vereist** voor elk beeld vóór livegang.

## Schadeformulier / backend
- Het formulier is een **demo**: bij verzenden verschijnt een demo-succesmelding en
  wordt **niets** verzonden; geselecteerde foto's worden **niet** geüpload (alleen
  bestandsnamen lokaal getoond).
- De submitlaag is configureerbaar via `src/data/business.ts` → `leadConfig`:
  - `submitMode: 'demo' | 'endpoint'` (nu `'demo'`).
  - `endpoint: null` — vul een echt endpoint in voor productie.
- **Nog nodig voor echte verzending:**
  - backend-endpoint / mailservice die het formulier ontvangt;
  - veilige foto-upload (opslag, bestandstype-/groottevalidatie, virusscan);
  - server-side validatie en spam-/botbescherming;
  - bevestigings-/notificatiemails.
- **WhatsApp** ("Stuur foto's via WhatsApp") is bewust **uitgeschakeld**
  (`leadConfig.whatsapp.enabled = false`). Alleen inschakelen wanneer de eigenaar
  bevestigt dat het nummer een WhatsApp-lijn is.

## Vercel
- De technische Vercel-configuratie is **gereed** (`rebuild/vercel.json`: framework
  vite, install `npm install`, build `npm run build`, output `dist`). Root Directory
  op Vercel: `clients/allround-schadeherstel-utrecht/rebuild`.
- Er is **nog niet gedeployed** en **niet gepusht**. Geen environment variables nodig.

## Domein, canonical & SEO
- `index.html` gebruikt een **placeholder-domein**
  (`https://www.allround-schadeherstel-utrecht.example/`) voor `canonical`, Open
  Graph `og:url`/`og:image` en JSON-LD `url`. Vervang dit door het bevestigde
  productiedomein.
- `og:image` verwijst naar een AI-sfeerbeeld; vervang eventueel door een echte foto.
- JSON-LD (`AutoRepair`) bevat uitsluitend geverifieerde NAP, coördinaten en
  openingstijden. **Geen** `aggregateRating` en **geen** FAQ-schema (bewust, want
  niet geverifieerd). Voeg rating pas toe bij echte Google-gegevens.

## Privacy & juridisch (vóór productie)
- Echte privacyverklaring publiceren (footer verwijst nu naar "Privacybeleid (in
  voorbereiding)").
- Bewaartermijnen en verwerkingsgrondslag voor formulierdata en foto-uploads
  vastleggen; verwerkersovereenkomst met eventuele mail-/hostingpartij.
- Beveiliging voor uploads (zie hierboven).
- Cookie-/consentbanner alleen nodig als er later tracking/embeds bijkomen.

## Nog te bevestigen door de eigenaar
Zie `docs/SOURCE-REPORT.md` §7 (plaats/adres, e-mail, WhatsApp, dienstenlijst,
beeldgoedkeuring, rating/reviews).
