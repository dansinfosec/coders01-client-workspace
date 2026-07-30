import type { Occasion } from "@/data/occasions";

/** Presentatie-helpers voor occasions. Nooit ontbrekende data verzinnen — toon "op aanvraag". */

/** "€ 6.450" of "Prijs op aanvraag". */
export function formatPrijs(prijs: number | null): string {
  if (prijs === null) return "Prijs op aanvraag";
  return `€ ${prijs.toLocaleString("nl-NL")}`;
}

/** "148.000 km" of "Op aanvraag". */
export function formatKm(km: number | null): string {
  if (km === null) return "Op aanvraag";
  return `${km.toLocaleString("nl-NL")} km`;
}

/** "81 kW / 110 pk", "110 pk", of "" als onbekend. */
export function formatVermogen(kw: number | null, pk: number | null): string {
  if (kw !== null && pk !== null) return `${kw} kW / ${pk} pk`;
  if (pk !== null) return `${pk} pk`;
  if (kw !== null) return `${kw} kW`;
  return "";
}

/** "1.199 cc" of "". */
export function formatCc(cc: number | null): string {
  return cc === null ? "" : `${cc.toLocaleString("nl-NL")} cc`;
}

export const transmissieLabel: Record<Occasion["transmissie"], string> = {
  handgeschakeld: "Handgeschakeld",
  automaat: "Automaat",
};

export const btwMargeLabel: Record<NonNullable<Occasion["btwMarge"]>, string> = {
  marge: "Margeauto",
  btw: "Btw-auto",
};

export interface SpecRow {
  label: string;
  value: string;
}

/** Volledige specificatietabel voor de detailpagina — alleen bekende velden. */
export function occasionSpecs(o: Occasion): SpecRow[] {
  const rows: SpecRow[] = [
    { label: "Merk", value: o.merk },
    { label: "Model", value: o.model },
    { label: "Uitvoering", value: o.uitvoering },
    { label: "Bouwjaar", value: String(o.bouwjaar) },
  ];
  if (o.eersteToelating) rows.push({ label: "Eerste toelating", value: o.eersteToelating });
  rows.push(
    { label: "Kilometerstand", value: formatKm(o.kmStand) },
    { label: "Brandstof", value: o.brandstof },
    {
      label: "Transmissie",
      value: o.versnellingen
        ? `${transmissieLabel[o.transmissie]} (${o.versnellingen})`
        : transmissieLabel[o.transmissie],
    },
    { label: "Carrosserie", value: `${o.carrosserie} · ${o.deuren} deuren · ${o.zitplaatsen} zitplaatsen` },
  );
  const cc = formatCc(o.cilinderinhoud);
  if (cc) rows.push({ label: "Cilinderinhoud", value: cc });
  const verm = formatVermogen(o.vermogenKw, o.vermogenPk);
  if (verm) rows.push({ label: "Vermogen", value: verm });
  if (o.emissieklasse) rows.push({ label: "Emissieklasse", value: o.emissieklasse });
  // Kleur alleen tonen als het een echte waarde is (geen TODO-placeholder).
  if (o.kleur && !o.kleur.toLowerCase().startsWith("todo")) {
    rows.push({ label: "Kleur", value: o.kleur });
  }
  if (o.interieur) rows.push({ label: "Interieur", value: o.interieur });
  if (o.btwMarge) rows.push({ label: "Bijzonderheid", value: btwMargeLabel[o.btwMarge] });
  if (typeof o.airco === "boolean") rows.push({ label: "Airco", value: o.airco ? "Ja" : "Nee" });
  return rows;
}

/** Korte kerngegevens voor op de kaart (max 4). */
export function occasionKeyFacts(o: Occasion): string[] {
  const facts = [String(o.bouwjaar), o.brandstof, transmissieLabel[o.transmissie]];
  facts.push(o.kmStand !== null ? formatKm(o.kmStand) : `${o.carrosserie}`);
  return facts;
}
