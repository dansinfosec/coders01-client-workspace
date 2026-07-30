/**
 * Configuratie voor de auto-verkoopmodule: begrijpelijke keuzekaarten (geen lange dropdowns) en
 * gewenste fotohoeken. Puur data — geen prijzen, geen beloftes.
 */

export interface ChoiceOption {
  value: string;
  label: string;
  /** Korte toelichting onder het label. */
  hint?: string;
}

export interface ChoiceGroup {
  /** Sleutel in de formulierstate. */
  key: string;
  label: string;
  options: ChoiceOption[];
  /** Toon een verplicht toelichtingsveld wanneer de waarde in deze lijst zit. */
  requiresDetailWhen?: string[];
  /** Kolommen bij weergave (2 of 3). */
  cols?: 2 | 3;
}

export const conditionGroups: ChoiceGroup[] = [
  {
    key: "transmissie",
    label: "Transmissie",
    cols: 3,
    options: [
      { value: "handgeschakeld", label: "Handgeschakeld" },
      { value: "automaat", label: "Automaat" },
      { value: "onbekend", label: "Weet ik niet" },
    ],
  },
  {
    key: "sleutels",
    label: "Aantal sleutels",
    cols: 3,
    options: [
      { value: "1", label: "1 sleutel" },
      { value: "2", label: "2 sleutels" },
      { value: "3+", label: "3 of meer" },
    ],
  },
  {
    key: "onderhoudshistorie",
    label: "Onderhoudshistorie",
    cols: 3,
    options: [
      { value: "volledig", label: "Volledig", hint: "Alle beurten bekend" },
      { value: "gedeeltelijk", label: "Gedeeltelijk" },
      { value: "geen", label: "Geen / onbekend" },
    ],
  },
  {
    key: "onderhoudsboekje",
    label: "Onderhoudsboekje aanwezig?",
    cols: 2,
    options: [
      { value: "ja", label: "Ja" },
      { value: "nee", label: "Nee" },
    ],
  },
  {
    key: "rijdt",
    label: "Rijdt de auto?",
    cols: 2,
    options: [
      { value: "ja", label: "Ja, rijdt normaal" },
      { value: "nee", label: "Nee / niet goed", hint: "Licht hieronder toe" },
    ],
    requiresDetailWhen: ["nee"],
  },
  {
    key: "waarschuwingslampjes",
    label: "Branden er waarschuwingslampjes?",
    cols: 2,
    options: [
      { value: "nee", label: "Nee" },
      { value: "ja", label: "Ja", hint: "Licht hieronder toe" },
    ],
    requiresDetailWhen: ["ja"],
  },
  {
    key: "technischeGebreken",
    label: "Bekende technische gebreken?",
    cols: 2,
    options: [
      { value: "nee", label: "Nee" },
      { value: "ja", label: "Ja", hint: "Beschrijf hieronder" },
    ],
    requiresDetailWhen: ["ja"],
  },
  {
    key: "zichtbareSchade",
    label: "Zichtbare schade?",
    cols: 2,
    options: [
      { value: "nee", label: "Nee" },
      { value: "ja", label: "Ja", hint: "Beschrijf hieronder" },
    ],
    requiresDetailWhen: ["ja"],
  },
  {
    key: "schadeverleden",
    label: "Schadeverleden?",
    cols: 3,
    options: [
      { value: "nee", label: "Nee" },
      { value: "ja", label: "Ja" },
      { value: "onbekend", label: "Onbekend" },
    ],
  },
  {
    key: "interieur",
    label: "Staat interieur",
    cols: 3,
    options: [
      { value: "goed", label: "Goed" },
      { value: "gebruikssporen", label: "Gebruikssporen" },
      { value: "beschadigd", label: "Beschadigd" },
    ],
  },
  {
    key: "banden",
    label: "Staat banden",
    cols: 3,
    options: [
      { value: "goed", label: "Goed profiel" },
      { value: "redelijk", label: "Redelijk" },
      { value: "vervangen", label: "Aan vervanging toe" },
    ],
  },
  {
    key: "verkooptermijn",
    label: "Gewenste verkooptermijn",
    cols: 3,
    options: [
      { value: "zsm", label: "Zo snel mogelijk" },
      { value: "maand", label: "Binnen een maand" },
      { value: "geen-haast", label: "Geen haast" },
    ],
  },
];

/** Labels om waarden weer te geven in de samenvatting. */
export const choiceLabel = (key: string, value: string): string => {
  const group = conditionGroups.find((g) => g.key === key);
  return group?.options.find((o) => o.value === value)?.label ?? value;
};

export interface PhotoSlot {
  id: string;
  label: string;
}

/** Gewenste fotohoeken (met voorbeeldkaartjes in de UI). */
export const photoSlots: PhotoSlot[] = [
  { id: "linksvoor", label: "Linksvoor" },
  { id: "rechtsvoor", label: "Rechtsvoor" },
  { id: "linksachter", label: "Linksachter" },
  { id: "rechtsachter", label: "Rechtsachter" },
  { id: "interieur", label: "Interieur" },
  { id: "dashboard", label: "Dashboard" },
  { id: "kilometerteller", label: "Kilometerteller" },
  { id: "schade", label: "Eventuele schade" },
];
