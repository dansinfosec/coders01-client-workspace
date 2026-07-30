/**
 * Occasion-service (vervangbare laag). Componenten gebruiken UITSLUITEND deze functies en nooit
 * rechtstreeks src/data/occasions.ts. Zo kunnen we later zonder componentwijziging omschakelen naar
 * een echte backend:
 *   getOccasions(filters)   → GET /api/occasions/?...
 *   getOccasionBySlug(slug) → GET /api/occasions/:slug/
 *   getSimilarOccasions(..) → GET /api/occasions/:slug/similar/
 * Zie docs/OCCASION_BACKEND_MIGRATION.md.
 */
import { occasions, type Occasion, type Transmissie } from "@/data/occasions";

export type OccasionSort = "nieuwste" | "prijs-op" | "prijs-af" | "km-op";

export interface OccasionFilters {
  /** Vrije zoekterm (merk, model, uitvoering, brandstof). */
  query?: string;
  brandstof?: string;
  transmissie?: Transmissie;
  /** Alleen occasions met een prijs t/m dit bedrag (euro). */
  maxPrijs?: number;
  sort?: OccasionSort;
}

/** Facetten die de filterbalk toont — afgeleid van de daadwerkelijke voorraad. */
export interface OccasionFacets {
  brandstoffen: string[];
  transmissies: Transmissie[];
  /** Hoogste geprijsde occasion (voor de prijs-slider); null als geen enkele prijs bekend is. */
  maxPrijs: number | null;
  total: number;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Volgorde-index voor status (beschikbare eerst, verkocht achteraan). */
const statusRank: Record<Occasion["status"], number> = {
  "nieuw-binnen": 0,
  beschikbaar: 1,
  gereserveerd: 2,
  binnenkort: 3,
  verkocht: 4,
};

function matches(o: Occasion, f: OccasionFilters): boolean {
  if (f.query) {
    const q = f.query.trim().toLowerCase();
    const haystack = `${o.merk} ${o.model} ${o.uitvoering} ${o.brandstof} ${o.carrosserie}`.toLowerCase();
    if (q && !haystack.includes(q)) return false;
  }
  if (f.brandstof && o.brandstof.toLowerCase() !== f.brandstof.toLowerCase()) return false;
  if (f.transmissie && o.transmissie !== f.transmissie) return false;
  if (typeof f.maxPrijs === "number" && (o.prijs === null || o.prijs > f.maxPrijs)) return false;
  return true;
}

function sortOccasions(list: Occasion[], sort: OccasionSort): Occasion[] {
  const arr = [...list];
  switch (sort) {
    case "prijs-op":
      // Occasions zonder prijs ("op aanvraag") achteraan.
      return arr.sort((a, b) => (a.prijs ?? Infinity) - (b.prijs ?? Infinity));
    case "prijs-af":
      return arr.sort((a, b) => (b.prijs ?? -Infinity) - (a.prijs ?? -Infinity));
    case "km-op":
      return arr.sort((a, b) => (a.kmStand ?? Infinity) - (b.kmStand ?? Infinity));
    case "nieuwste":
    default:
      return arr.sort(
        (a, b) => statusRank[a.status] - statusRank[b.status] || b.bouwjaar - a.bouwjaar,
      );
  }
}

export async function getOccasions(filters: OccasionFilters = {}): Promise<Occasion[]> {
  await delay(140);
  const filtered = occasions.filter((o) => matches(o, filters));
  return sortOccasions(filtered, filters.sort ?? "nieuwste");
}

export async function getOccasionBySlug(slug: string): Promise<Occasion | null> {
  await delay(120);
  return occasions.find((o) => o.slug === slug) ?? null;
}

/** Vergelijkbare occasions: zelfde brandstof of carrosserie, exclusief de huidige. */
export async function getSimilarOccasions(slug: string, limit = 3): Promise<Occasion[]> {
  await delay(120);
  const current = occasions.find((o) => o.slug === slug);
  if (!current) return [];
  const scored = occasions
    .filter((o) => o.slug !== slug && o.status !== "verkocht")
    .map((o) => ({
      o,
      score: (o.brandstof === current.brandstof ? 2 : 0) + (o.carrosserie === current.carrosserie ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.o.bouwjaar - a.o.bouwjaar);
  return scored.slice(0, limit).map((s) => s.o);
}

/** Facetten voor de filterbalk (synchronisatie met de echte voorraad). */
export function getOccasionFacets(): OccasionFacets {
  const brandstoffen = Array.from(new Set(occasions.map((o) => o.brandstof))).sort();
  const transmissies = Array.from(new Set(occasions.map((o) => o.transmissie))) as Transmissie[];
  const prijzen = occasions.map((o) => o.prijs).filter((p): p is number => p !== null);
  return {
    brandstoffen,
    transmissies,
    maxPrijs: prijzen.length ? Math.max(...prijzen) : null,
    total: occasions.length,
  };
}
