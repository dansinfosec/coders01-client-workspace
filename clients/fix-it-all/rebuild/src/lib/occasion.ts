import type { Occasion, Transmissie } from "@/data/occasions";

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

export const transmissieLabel: Record<Transmissie, string> = {
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

/** Korte kerngegevens voor op de kaart (max 4). */
export function occasionKeyFacts(o: Occasion): string[] {
  const facts = [String(o.bouwjaar), o.brandstof];
  if (o.transmissie) facts.push(transmissieLabel[o.transmissie]);
  facts.push(o.kmStand !== null ? formatKm(o.kmStand) : `${o.carrosserie}`);
  return facts;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

const nl = (n: number) => n.toLocaleString("nl-NL");

/**
 * Gegroepeerde specificaties voor de detailpagina. Lege velden/groepen worden weggelaten,
 * zodat er nooit lege secties of "onbekend"-rijen verschijnen.
 */
export function occasionSpecGroups(o: Occasion): SpecGroup[] {
  const groups: SpecGroup[] = [];
  const push = (title: string, rows: (SpecRow | null)[]) => {
    const real = rows.filter((r): r is SpecRow => r !== null && r.value !== "");
    if (real.length > 0) groups.push({ title, rows: real });
  };
  const row = (label: string, value: string | number | null | undefined): SpecRow | null =>
    value === null || value === undefined || value === "" ? null : { label, value: String(value) };

  const kleur = o.kleur && !o.kleur.toLowerCase().startsWith("todo") ? o.kleur : "";
  const transmissie = o.transmissie
    ? o.versnellingen
      ? `${transmissieLabel[o.transmissie]} (${o.versnellingen})`
      : transmissieLabel[o.transmissie]
    : "";

  push("Algemeen", [
    row("Merk", o.merk),
    row("Model", o.model),
    row("Uitvoering", o.uitvoering),
    row("Carrosserie", o.carrosserie),
    row("Bouwjaar", o.bouwjaar),
    row("Eerste toelating", o.eersteToelating),
    row("Kleur", kleur),
    row("Aantal deuren", o.deuren),
    row("Aantal zitplaatsen", o.zitplaatsen),
    row("Kenteken", o.kenteken),
    row("APK", o.apkVervaldatum ? `Tot ${o.apkVervaldatum}` : ""),
    o.btwMarge ? row("Bijzonderheid", btwMargeLabel[o.btwMarge]) : null,
  ]);

  push("Motor & prestaties", [
    row("Brandstof", o.brandstof),
    row("Transmissie", transmissie),
    row("Cilinderinhoud", formatCc(o.cilinderinhoud)),
    row("Aantal cilinders", o.aantalCilinders),
    row("Vermogen", formatVermogen(o.vermogenKw, o.vermogenPk)),
  ]);

  push("Verbruik & milieu", [
    row("Emissieklasse", o.emissieklasse),
    row("CO₂-uitstoot", o.co2Gecombineerd != null ? `${nl(o.co2Gecombineerd)} g/km` : ""),
    row("Verbruik gecombineerd", o.verbruikGecombineerd != null ? `${nl(o.verbruikGecombineerd)} l/100 km` : ""),
    row("Energielabel", o.energielabel),
  ]);

  push("Gewicht & afmetingen", [
    row("Massa ledig", o.massaLedig != null ? `${nl(o.massaLedig)} kg` : ""),
    row("Toegestane max. massa", o.toegestaneMaxMassa != null ? `${nl(o.toegestaneMaxMassa)} kg` : ""),
    row("Lengte", o.lengteCm != null ? `${nl(o.lengteCm)} cm` : ""),
    row("Breedte", o.breedteCm != null ? `${nl(o.breedteCm)} cm` : ""),
    row("Hoogte", o.hoogteCm != null ? `${nl(o.hoogteCm)} cm` : ""),
    row("Wielbasis", o.wielbasisCm != null ? `${nl(o.wielbasisCm)} cm` : ""),
  ]);

  push("Kosten", [
    row("Catalogusprijs (nieuwprijs)", o.catalogusprijs != null ? `€ ${nl(o.catalogusprijs)}` : ""),
  ]);

  return groups;
}

/** Compacte kernrijen voor de detail-sidebar (label + waarde). Alleen bekende velden. */
export function occasionCoreFacts(o: Occasion): SpecRow[] {
  const rows: (SpecRow | null)[] = [
    { label: "Bouwjaar", value: String(o.bouwjaar) },
    { label: "Kilometerstand", value: formatKm(o.kmStand) },
    { label: "Brandstof", value: o.brandstof },
    o.transmissie ? { label: "Transmissie", value: transmissieLabel[o.transmissie] } : null,
    formatVermogen(o.vermogenKw, o.vermogenPk)
      ? { label: "Vermogen", value: formatVermogen(o.vermogenKw, o.vermogenPk) }
      : null,
    { label: "Carrosserie", value: o.carrosserie },
  ];
  return rows.filter((r): r is SpecRow => r !== null);
}

const OPTIE_CATEGORIES: { title: string; test: RegExp }[] = [
  {
    title: "Veiligheid",
    test: /airbag|abs|esp|esc|slip|blokkeer|alarm|isofix|gordel|remass|noodrem|dode.?hoek|spoor|verkeer|bots|bandenspanning|tractie|stabilit|waarschuw|avoidance|lane|immobil|startonderbrek|hill|aanrijd/i,
  },
  {
    title: "Comfort & gemak",
    test: /airco|climate|clima|stoelverwarm|stuurbekrachtig|elektr|cruise|parkeer|regensensor|lichtsensor|verwarming|armsteun|keyless|start.?stop|verstelb|centrale vergrendel|afstandsbedien|snelheidsbegrenz|ecc|comfort/i,
  },
  {
    title: "Multimedia & navigatie",
    test: /audio|navigat|navi|bluetooth|usb|dab|radio|\bcd\b|boordcomputer|telefoon|apple|android|carplay|scherm|camera|multimedia|\baux\b|mp3|speaker/i,
  },
  {
    title: "Exterieur",
    test: /velg|lichtmeta|xenon|\bled\b|koplamp|trekhaak|dakrail|getint|spoiler|mistlamp|buitenspiegel|schuifdak|panorama|\bdak\b|bumper|chroom|grille|metallic|lak/i,
  },
  {
    title: "Interieur",
    test: /leder|\bleer\b|stof|bekleding|sportstoel|neerklapb|bagage|interieur|hemelbekled|sfeerverlicht|stoel/i,
  },
];

/** Groepeert een platte optielijst in categorieën (alleen niet-lege categorieën). */
export function groupOpties(opties: string[]): { title: string; items: string[] }[] {
  const buckets = new Map<string, string[]>();
  const order = [...OPTIE_CATEGORIES.map((c) => c.title), "Overig"];
  for (const opt of opties) {
    const cat = OPTIE_CATEGORIES.find((c) => c.test.test(opt))?.title ?? "Overig";
    if (!buckets.has(cat)) buckets.set(cat, []);
    buckets.get(cat)!.push(opt);
  }
  return order
    .filter((t) => buckets.has(t))
    .map((t) => ({ title: t, items: buckets.get(t)! }));
}
