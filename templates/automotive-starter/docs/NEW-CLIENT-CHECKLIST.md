# Nieuw klantproject — checklist

Van template naar een live klantsite. Werk deze lijst van boven naar beneden af.
Vink niets af op basis van aannames — vul alleen in wat de klant heeft **bevestigd**.

---

## 0. Project aanmaken

1. Kopieer `templates/automotive-starter` naar `clients/<klant>/rebuild`
   (kopieer **niet** `node_modules/` of `dist/`).
2. `cd clients/<klant>/rebuild && npm install`
3. Pas `package.json` → `name` en `description` aan naar de klant.
4. `npm run dev` en controleer of de placeholder-site draait.

## 1. Feature flags (`src/config/features.ts`)

Zet per klant aan/uit wat van toepassing is:

- `occasions` — verkoopt de klant occasions?
- `appointments` — online afspraken?
- `vehicleSale` — "auto verkopen"-flow?
- `vacancies` — vacatures / open sollicitatie?
- `whatsapp` — **pas aanzetten als er een geverifieerd WhatsApp-nummer in `company.ts` staat**
- `rdwCheck` — kentekencheck in de afspraakflow?
- `demoDisclaimers` — laat op **true** zolang er geen echte backend is

> Uitgeschakelde modules verdwijnen automatisch uit navigatie, footer, CTA's en routes.
> Controleer na het wijzigen dat er geen dode links zijn (`npm run dev`).

## 2. Branding (`src/config/brand.ts`)

Zie [`BRANDING-GUIDE.md`](BRANDING-GUIDE.md). Kort:

- Vervang de kleuren (`tokens`) door de merkkleuren.
- Zet `logo.imageSrc` (+ `imageSrcInvert` voor donkere achtergrond) óf pas `logo.text`/`logo.badge` aan.
- Zet `favicon` en vervang `public/favicon.svg`.
- Werk `themeColor` in `src/config/site.ts` en de `<meta name="theme-color">` in `index.html` bij (moet matchen met `brand.dark`).

## 3. Site + SEO (`src/config/site.ts`)

- `url` → het definitieve live domein (voor canonicals en JSON-LD).
- `lang` / `locale` indien nodig.
- `defaultTitle` / `defaultDescription`.
- Optioneel `defaultOgImage` (pad in `public/assets/brand/`).
- Werk ook `index.html` `<title>` en `<meta description>` bij (statische fallback).

## 4. Bedrijfsgegevens (`src/data/company.ts`)

Vervang **elke** placeholder en verwijder de bijbehorende `TODO`:

- [ ] `name`
- [ ] `slogan`, `tagline`, `intro`
- [ ] `foundedYear` (of laat `null` → "sinds …" wordt dan nergens getoond)
- [ ] `phone` (`display` + `href`), optioneel `mobile`
- [ ] `email`
- [ ] `address` (straat, postcode, plaats, `mapsUrl`)
- [ ] `openingHours` + `openingSummary`
- [ ] `social` (facebook/instagram of `null`)
- [ ] `serviceArea`
- [ ] `usps`
- [ ] `offer` (of `null` als er geen actie is)
- [ ] `whatsapp` (échte nummer) — pas daarna `features.whatsapp = true`
- [ ] `rating` / `kvk` / `vat` blijven `null` tot geverifieerd

## 5. Content & data

- **Diensten** (`src/data/services.ts`) — zie [`DATA-MIGRATION.md`](DATA-MIGRATION.md).
- **Occasions** (`src/data/occasions.ts`) — vervang de demo-auto's; koppel foto's.
- **Werkzaamheden** (`src/data/werkzaamheden.ts`) — de boekbare items in de afspraakflow.

## 6. Assets

Plaats klant-eigen bestanden onder `public/assets/` (zie mapstructuur in
`DATA-MIGRATION.md`) en verwijs ernaar vanuit `brand.ts` / `services.ts` / `occasions.ts`.
Geef ze **SEO-vriendelijke bestandsnamen**. Geen hotlinking naar externe URL's.

## 7. Redirects (`vercel.json`)

Leeg in de template. Voeg **alleen** de oude URL's van déze klant toe (bijv. vanaf een
WordPress-migratie) als 301-redirects. Neem geen redirects van een andere klant over.

## 8. Verificatie vóór deployment

- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 warnings
- [ ] `npm run build` — slaagt
- [ ] `npm run preview` en test op **320 / 375 / 390 / 430 / desktop**
- [ ] Alle telefoon-/mail-/WhatsApp-links wijzen naar de **klant** (geen placeholders meer)
- [ ] Geen zichtbare `TODO`/placeholder-tekst meer op de site
- [ ] Structured data klopt (test met de Rich Results Test)
- [ ] Feature flags kloppen; geen dode links
- [ ] Demo-meldingen aan zolang er geen backend is (`features.demoDisclaimers`)

## 9. Deploy

Volg de deployafspraken van de workspace. **Commit, push en deploy alleen op
expliciete instructie.**
