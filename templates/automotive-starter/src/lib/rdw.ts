/** RDW Open Data — types en normalisatie (los van de fetch-laag). */

/** Rauwe voertuigrij (relevante velden) van resource m9d7-ebf2. */
export interface RdwVehicleRaw {
  kenteken?: string;
  merk?: string;
  handelsbenaming?: string;
  voertuigsoort?: string;
  datum_eerste_toelating?: string; // YYYYMMDD
  vervaldatum_apk?: string; // YYYYMMDD
  eerste_kleur?: string;
  aantal_deuren?: string;
  aantal_zitplaatsen?: string;
}

/** Rauwe brandstofrij van resource 8ys7-d773. */
export interface RdwFuelRaw {
  brandstof_omschrijving?: string;
}

/** Genormaliseerd voertuig zoals de UI het gebruikt. */
export interface Vehicle {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  voertuigsoort: string;
  brandstof: string;
  /** DD-MM-YYYY of "". */
  datumEersteToelating: string;
  /** DD-MM-YYYY of "". */
  vervaldatumApk: string;
}

/** YYYYMMDD → DD-MM-YYYY (of "" bij onbekend). */
export function formatRdwDate(raw?: string): string {
  if (!raw || raw.length !== 8) return "";
  return `${raw.slice(6, 8)}-${raw.slice(4, 6)}-${raw.slice(0, 4)}`;
}

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .trim();

export function normalizeVehicle(
  kenteken: string,
  vehicle: RdwVehicleRaw | undefined,
  fuel: RdwFuelRaw[] | undefined,
): Vehicle | null {
  if (!vehicle || !vehicle.merk) return null;
  const brandstof = (fuel ?? [])
    .map((f) => f.brandstof_omschrijving)
    .filter(Boolean)
    .join(" / ");
  return {
    kenteken,
    merk: titleCase(vehicle.merk ?? ""),
    handelsbenaming: titleCase(vehicle.handelsbenaming ?? ""),
    voertuigsoort: titleCase(vehicle.voertuigsoort ?? ""),
    brandstof: brandstof ? titleCase(brandstof) : "",
    datumEersteToelating: formatRdwDate(vehicle.datum_eerste_toelating),
    vervaldatumApk: formatRdwDate(vehicle.vervaldatum_apk),
  };
}
