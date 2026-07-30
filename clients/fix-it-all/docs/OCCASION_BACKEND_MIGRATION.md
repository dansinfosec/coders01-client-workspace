# Occasions — migratie van lokale data naar backend-API

_Verplichte deliverable (audit §8). Beschrijft hoe de occasionsmodule van de tijdelijke, lokale
databron overgaat naar een echte API — **zonder** componentwijzigingen._

## Huidige architectuur (MVP)

```
componenten ──▶ services/occasionService.ts ──▶ data/occasions.ts   (tijdelijke bron)
```

- Componenten praten **nooit** rechtstreeks met `data/occasions.ts`.
- Alle toegang loopt via `occasionService.ts`:
  - `getOccasions(filters): Promise<Occasion[]>`
  - `getOccasionBySlug(slug): Promise<Occasion | null>`
  - `getSimilarOccasions(slug, limit): Promise<Occasion[]>`
  - `getOccasionFacets(): OccasionFacets` (filteropties, synchroon uit de voorraad)
- De functies zijn nu al `async` en simuleren netwerklatentie, zodat loading-states in de UI
  (`OccasionsPage`, `OccasionDetailPage`) al werken en de API-omzetting niets aan de UI verandert.

## Doelarchitectuur

```
componenten ──▶ services/occasionService.ts ──▶ GET /api/occasions/...   (echte backend)
```

### Endpoints

| Servicefunctie | HTTP | Endpoint |
|---|---|---|
| `getOccasions(filters)` | GET | `/api/occasions/?q=&brandstof=&transmissie=&sort=` |
| `getOccasionBySlug(slug)` | GET | `/api/occasions/:slug/` |
| `getSimilarOccasions(slug)` | GET | `/api/occasions/:slug/similar/?limit=3` |
| facetten | GET | `/api/occasions/facets/` (of afleiden uit de lijst) |

### Datamodel (voorstel, Django/DRF)

Velden 1-op-1 uit de `Occasion`-interface (`src/data/occasions.ts`):
`slug, status, merk, model, uitvoering, title, prijs (nullable), bouwjaar, eersteToelating,
brandstof, transmissie, versnellingen, carrosserie, deuren, zitplaatsen, kmStand (nullable),
cilinderinhoud, vermogenPk, vermogenKw, kenteken, kleur, interieur, emissieklasse, btwMarge,
airco, highlights[], description, bijzonderheden, photos[]`.

`OccasionPhoto`: `src`, `alt`, `sortIndex`. Foto's in externe object-storage (bv. Cloudflare R2),
niet op de app-filesystem; lever responsive varianten + expliciete afmetingen (CWV).

### Statussen
`nieuw-binnen · beschikbaar · gereserveerd · verkocht · binnenkort` (zie `data/occasionStatus.ts`).
De klant beheert de status per auto (Django Admin). Verkochte auto's blijven vindbaar maar tonen
"Verkocht" en verbergen CTA's (al geïmplementeerd in `OccasionDetailPage`).

## Migratiestappen

1. Bouw de backend + endpoints; houd het JSON-antwoord gelijk aan de `Occasion`-interface
   (of map in de service).
2. Vervang in `occasionService.ts` de `occasions`-import + `delay()` door `fetch()`-calls.
   **Signatures blijven identiek** → geen componentwijziging.
3. Zet foto's op object-storage en vul `photos[]`; de UI schakelt dan automatisch van de
   placeholder (`OccasionMedia`) naar echte beelden.
4. Optioneel: server-side filtering/sortering i.p.v. client-side (`sortOccasions`/`matches`
   verplaatsen naar de query).
5. SEO: `vehicleSchema` (al aanwezig) vullen met echte foto-URL's; sitemap genereren uit de API.

## Belangrijk
- Geen verzonnen data: onbekende velden blijven `null` en tonen "op aanvraag".
- Geen kenteken/klantdata in publieke URL's of logs.
