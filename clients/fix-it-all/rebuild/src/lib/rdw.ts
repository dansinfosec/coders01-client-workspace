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
  cilinderinhoud?: string;
  massa_ledig_voertuig?: string;
}

/** Rauwe brandstofrij van resource 8ys7-d773. */
export interface RdwFuelRaw {
  brandstof_omschrijving?: string;
  nettomaximumvermogen?: string; // kW
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
  /** Bouwjaar afgeleid uit datum eerste toelating; null als onbekend. */
  bouwjaar: number | null;
  /** Optionele extra RDW-velden (null = onbekend). */
  kleur: string;
  cilinderinhoud: number | null;
  massaLedig: number | null;
  aantalDeuren: number | null;
  aantalZitplaatsen: number | null;
  /** Vermogen (pk), afgeleid uit kW; null = onbekend. */
  vermogenPk: number | null;
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

const num = (raw?: string): number | null => {
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : null;
};

export function normalizeVehicle(
  kenteken: string,
  vehicle: RdwVehicleRaw | undefined,
  fuel: RdwFuelRaw[] | undefined,
): Vehicle | null {
  if (!vehicle || !vehicle.merk) return null;
  const rows = fuel ?? [];
  const brandstof = rows
    .map((f) => f.brandstof_omschrijving)
    .filter(Boolean)
    .join(" / ");
  const kws = rows
    .map((f) => (f.nettomaximumvermogen ? Number(f.nettomaximumvermogen) : NaN))
    .filter((n) => Number.isFinite(n));
  const kw = kws.length > 0 ? Math.max(...kws) : null;
  const eersteToelating = formatRdwDate(vehicle.datum_eerste_toelating);
  const kleur = vehicle.eerste_kleur ?? "";

  return {
    kenteken,
    merk: titleCase(vehicle.merk ?? ""),
    handelsbenaming: titleCase(vehicle.handelsbenaming ?? ""),
    voertuigsoort: titleCase(vehicle.voertuigsoort ?? ""),
    brandstof: brandstof ? titleCase(brandstof) : "",
    datumEersteToelating: eersteToelating,
    vervaldatumApk: formatRdwDate(vehicle.vervaldatum_apk),
    bouwjaar: vehicle.datum_eerste_toelating?.length === 8 ? Number(vehicle.datum_eerste_toelating.slice(0, 4)) : null,
    kleur: kleur && kleur.toLowerCase().startsWith("niet") ? "" : titleCase(kleur),
    cilinderinhoud: num(vehicle.cilinderinhoud),
    massaLedig: num(vehicle.massa_ledig_voertuig),
    aantalDeuren: num(vehicle.aantal_deuren),
    aantalZitplaatsen: num(vehicle.aantal_zitplaatsen),
    vermogenPk: kw !== null ? Math.round(kw * 1.35962) : null,
  };
}
