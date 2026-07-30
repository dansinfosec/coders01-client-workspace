# RDW-verrijking van occasions

De occasionvoorraad komt van de **originele site** (Autodealers.nl-feed, dealer 5359). RDW Open
Data wordt **alleen** gebruikt om ontbrekende technische basisgegevens per kenteken aan te vullen —
nooit om bestaande, geverifieerde data te overschrijven.

## Gegevensstromen

```
data/occasions.ts        ← leidend (originele site: prijs, km, foto's, uitvoering, omschrijving, …)
data/rdwEnrichment.ts    ← gecachete RDW-data per kenteken (gegenereerd, niet handmatig bewerken)
lib/enrichOccasions.ts   ← merge: vult alleen lege velden + voegt RDW-only extra's toe, met bron
services/occasionService ← gebruikt de verrijkte lijst (enrichedOccasions)
```

De merge draait **eenmalig bij het laden van de module** (`occasions.map(enrich)`), dus er is
**geen netwerkcall per React-render**. De RDW-data zelf is een build-time snapshot in
`data/rdwEnrichment.ts`, gegenereerd met het enrichment-script (RDW Open Data, 2026-07-30).

## Welke velden komen waarvandaan

### Uit de originele site (leidend — nooit door RDW overschreven)
`prijs`, `kilometerstand`, `foto's`, `uitvoering`, `omschrijving`, `opties`, `onderhoud`, `schade`,
`bijzonderheden`, `status`, `merk`, `model`, `carrosserie`, `transmissie`, `kleur`, `kenteken`, en
`vermogen`/`bouwjaar` waar de site die al levert.

### Aangevuld uit RDW **alleen wanneer leeg** (`null`)
| Occasion-veld | RDW-bron |
|---|---|
| `cilinderinhoud` | `cilinderinhoud` |
| `zitplaatsen` | `aantal_zitplaatsen` |
| `deuren` | `aantal_deuren` |
| `vermogenKw` / `vermogenPk` | `nettomaximumvermogen` (kW; pk = kW × 1,35962) |
| `emissieklasse` | `emissiecode_omschrijving` → "Euro N" |
| `eersteToelating` | `datum_eerste_toelating` |

### RDW-only extra's (bestaan niet op de site → altijd uit RDW)
`apkVervaldatum` (`vervaldatum_apk`), `voertuigsoort`, `aantalCilinders`, `co2Gecombineerd`
(`co2_uitstoot_gecombineerd`/`_gewogen`), `verbruikGecombineerd` (`brandstofverbruik_gecombineerd`),
`energielabel` (`zuinigheidsclassificatie`), `massaLedig` (`massa_ledig_voertuig`),
`toegestaneMaxMassa`, `lengteCm`/`breedteCm`/`hoogteCm`/`wielbasisCm`, `catalogusprijs`
(nieuwprijs — **≠** verkoopprijs; apart gelabeld in de UI).

### Komt **NOOIT** uit RDW
Verkoopprijs, kilometerstand, foto's, opties/uitrusting, onderhoudshistorie, schade, uitvoering en
de verkoop-omschrijving. RDW kent deze niet of ze zijn niet betrouwbaar/actueel; die blijven van de
originele site of blijven leeg.

## Bronregistratie

Per verrijkt veld wordt de herkomst bewaard in `occasion.sources` (bijv.
`{ cilinderinhoud: "rdw", zitplaatsen: "site", apkVervaldatum: "rdw" }`). Zo is in code én in de
data zichtbaar wat van de site komt en wat door RDW is aangevuld.

## Foutafhandeling & caching

- **Geen kenteken** (bijv. de Mazda CX-5): verrijking wordt overgeslagen; de occasion rendert
  volledig op basis van de site-data.
- **Kenteken niet in RDW / RDW-fout tijdens generatie**: er komt geen entry in `rdwEnrichment.ts`;
  `enrich()` geeft de occasion ongewijzigd terug. De pagina blijft dus altijd renderen.
- **Caching**: RDW is één keer bevraagd en als statische data opgeslagen. De runtime doet géén
  live RDW-calls voor de voorraad. (De live `rdwService`/`/api/rdw`-proxy blijft bestaan voor de
  interactieve kentekencheck in de afspraak-/verkoopflow — dáár mét caching + rate-limit.)
- Dekking bij de laatste run: **24 van 25** voertuigen verrijkt (1 zonder kenteken).

## Later: backend / CMS

Wanneer de occasions uit een echte backend/CMS komen:
1. Vervang `data/occasions.ts` door `GET /api/occasions` in `occasionService` (interface blijft gelijk).
2. Voer de RDW-verrijking **server-side** uit bij het aanmaken/bijwerken van een occasion (zelfde
   regels: alleen lege velden aanvullen, bron opslaan). Persisteer het resultaat, ververs periodiek
   (bijv. APK-datum) via een cron.
3. `lib/enrichOccasions.ts` vervalt dan als client-stap; de merge-logica verhuist naar de backend.
4. Bewaar de RDW-snapshotdatum per veld voor auditbaarheid.

## Regenereren

Draai het enrichment-script (RDW Open Data, resources `m9d7-ebf2` voertuigen + `8ys7-d773`
brandstof) over de kentekens uit de voorraad en overschrijf `src/data/rdwEnrichment.ts`. Bewerk dat
bestand niet met de hand.
