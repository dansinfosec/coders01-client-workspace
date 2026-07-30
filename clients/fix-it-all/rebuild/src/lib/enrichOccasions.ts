/**
 * RDW-verrijking (eenmalig, bij module-load — GEEN netwerkcall per render).
 *
 * De occasion-data uit `data/occasions.ts` (bron: originele site / Autodealers-feed) is leidend.
 * Deze laag vult UITSLUITEND lege (`null`/ontbrekende) technische basisvelden aan met RDW-data uit
 * de gecachete `data/rdwEnrichment.ts` en voegt RDW-only extra's toe (APK, CO₂, massa, afmetingen).
 *
 * Regels (zie docs/RDW-OCCASION-ENRICHMENT.md):
 *  - nooit bestaande, geverifieerde waarden overschrijven;
 *  - geen kenteken → geen verrijking;
 *  - RDW ontbreekt → occasion blijft ongewijzigd renderen;
 *  - prijs, km, foto's, uitvoering, omschrijving, opties, schade komen NOOIT uit RDW;
 *  - per aangevuld veld wordt de bron vastgelegd in `occasion.sources`.
 */
import { occasions, type Occasion } from "@/data/occasions";
import { rdwEnrichment } from "@/data/rdwEnrichment";
import { occasionOptions } from "@/data/occasionOptions";

function enrich(o: Occasion): Occasion {
  // Opties (site-data) koppelen; onafhankelijk van RDW.
  const opties = occasionOptions[o.slug];
  const base: Occasion = opties && opties.length > 0 ? { ...o, opties } : o;

  const rdw = rdwEnrichment[o.kenteken];
  if (!rdw) return base; // geen kenteken-match of RDW onbekend → alleen opties

  const sources: Record<string, "site" | "rdw"> = {};
  const next: Occasion = { ...base };
  if (base.opties) sources.opties = "site";

  // Bestaande velden: alleen aanvullen wanneer leeg (null); anders blijft de site-waarde staan.
  const fill = (cur: number | null, val: number | undefined, key: string): number | null => {
    if (val === undefined) return cur;
    if (cur === null) {
      sources[key] = "rdw";
      return val;
    }
    sources[key] = "site";
    return cur;
  };
  next.cilinderinhoud = fill(o.cilinderinhoud, rdw.cilinderinhoud, "cilinderinhoud");
  next.zitplaatsen = fill(o.zitplaatsen, rdw.aantalZitplaatsen, "zitplaatsen");
  next.deuren = fill(o.deuren, rdw.aantalDeuren, "deuren");
  next.vermogenPk = fill(o.vermogenPk, rdw.vermogenPk, "vermogenPk");
  next.vermogenKw = fill(o.vermogenKw, rdw.vermogenKw, "vermogenKw");

  if (rdw.emissieklasse && !o.emissieklasse) {
    next.emissieklasse = rdw.emissieklasse;
    sources.emissieklasse = "rdw";
  }
  if (rdw.datumEersteToelating && !o.eersteToelating) {
    next.eersteToelating = rdw.datumEersteToelating;
    sources.eersteToelating = "rdw";
  }

  // RDW-only extra's (bestaan niet op de site → altijd uit RDW, nooit overschrijvend).
  const bag = next as unknown as Record<string, unknown>;
  const setStr = (val: string | undefined, key: string) => {
    if (!val) return;
    bag[key] = val;
    sources[key] = "rdw";
  };
  const setNum = (val: number | undefined, key: string) => {
    if (val === undefined) return;
    bag[key] = val;
    sources[key] = "rdw";
  };
  setStr(rdw.apkVervaldatum, "apkVervaldatum");
  setStr(rdw.voertuigsoort, "voertuigsoort");
  setStr(rdw.energielabel, "energielabel");
  setNum(rdw.aantalCilinders, "aantalCilinders");
  setNum(rdw.co2Gecombineerd, "co2Gecombineerd");
  setNum(rdw.verbruikGecombineerd, "verbruikGecombineerd");
  setNum(rdw.massaLedig, "massaLedig");
  setNum(rdw.toegestaneMaxMassa, "toegestaneMaxMassa");
  setNum(rdw.lengteCm, "lengteCm");
  setNum(rdw.breedteCm, "breedteCm");
  setNum(rdw.hoogteCm, "hoogteCm");
  setNum(rdw.wielbasisCm, "wielbasisCm");
  setNum(rdw.catalogusprijs, "catalogusprijs");

  next.sources = sources;
  return next;
}

/** Verrijkte voorraad — eenmalig berekend bij import (niet per render). */
export const enrichedOccasions: Occasion[] = occasions.map(enrich);
