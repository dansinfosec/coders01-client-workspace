# Automotive Starter

Herbruikbare **React + Vite + TypeScript** starter voor websites van garages en
autobedrijven. Klant-onafhankelijk: een nieuw project pas je hoofdzakelijk aan via
**configuratie, data en assets** — niet door componenten te herschrijven.

Afgeleid van een productieklaar autobedrijf-project. De afspraak- en
auto-verkoopmodule draaien op een **vervangbare mock-service** (nog geen backend);
zie [`docs/DATA-MIGRATION.md`](docs/DATA-MIGRATION.md).

---

## Wat zit erin

- Responsive desktop- en mobiele navigatie (toegankelijk: focus trap, Escape, scroll lock)
- Homepage, dienstenoverzicht en **dynamische dienstpagina's**
- **RDW-kentekencheck** (via `/api/rdw` serverless proxy, met client-side fallback)
- **Afspraakflow** met kalender en tijdsloten
- **Occasions**-overzicht met filters + occasion-detailpagina
- **Auto-verkoopflow** met foto-upload
- Contact, Over ons, Vacature / open sollicitatie, 404
- SEO + JSON-LD structured data, toegankelijke formulieren
- Service-abstraction laag voor toekomstige backendkoppeling
- Duidelijke **mock/demo-modi** en **feature flags**

## Snel starten

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # serveer de productiebuild
npm run typecheck  # tsc --noEmit
npm run lint       # eslint --max-warnings 0
```

## Waar pas je wat aan

| Wil je aanpassen… | Bestand |
|---|---|
| Kleuren, fonts, logo, favicon, radius | `src/config/brand.ts` |
| Sitenaam, domein, taal, SEO-defaults | `src/config/site.ts` |
| Modules aan/uit | `src/config/features.ts` |
| Bedrijfsgegevens (NAP, tijden, socials) | `src/data/company.ts` |
| Diensten | `src/data/services.ts` |
| Occasions | `src/data/occasions.ts` |
| Navigatie | `src/data/navigation.ts` (meestal automatisch via features) |
| Boekbare werkzaamheden (afspraak) | `src/data/werkzaamheden.ts` |
| Logo's / foto's | `public/assets/brand/`, `public/assets/services/`, `public/assets/occasions/` |

> **Alle placeholderwaarden zijn fictief** (Autobedrijf Voorbeeld, Voorbeeldstad,
> telefoon `00 – 000 00 00`, `info@example.com`). De template belt, mailt of
> WhatsAppt dus nooit per ongeluk een echt bedrijf. Vervang ze per klant.

## Documentatie

- [`docs/NEW-CLIENT-CHECKLIST.md`](docs/NEW-CLIENT-CHECKLIST.md) — een nieuw klantproject opzetten, stap voor stap
- [`docs/BRANDING-GUIDE.md`](docs/BRANDING-GUIDE.md) — kleuren, fonts, logo en favicon vervangen
- [`docs/DATA-MIGRATION.md`](docs/DATA-MIGRATION.md) — crawlerresultaten verwerken, diensten/occasions invoeren, mock → backend

## Architectuur in één alinea

Componenten lezen **nooit** hardgecodeerde klantfeiten. Bedrijfsgegevens komen uit
`src/data/company.ts`, visuele identiteit uit `src/config/brand.ts` (via `applyBrand()`
naar CSS-variabelen die Tailwind's semantische tokens voeden), en modules staan aan/uit
via `src/config/features.ts`. Data-toegang loopt via de `src/services/*`-laag (nu mocks),
zodat je later een echte backend koppelt zonder componenten aan te raken.

## Belangrijke conventies

- **Verzin nooit bedrijfsfeiten.** Onbekend = `null` of leeg + een `TODO`. Geen
  verzonnen reviews, prijzen, garanties of keurmerken.
- **Geen dode links:** een uitgeschakelde module verdwijnt automatisch uit navigatie,
  footer, CTA's én routes (catch-all 404).
- **Demo blijft demo:** zolang er geen backend is, tonen de flows een eerlijke
  demo-melding (schakelbaar via `features.demoDisclaimers`). Beloof niet dat gegevens
  worden opgeslagen.
