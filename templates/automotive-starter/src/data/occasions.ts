import type { OccasionStatus } from "@/data/occasionStatus";

/**
 * Centrale occasion-data — single source of truth voor de occasionsmodule.
 * Componenten praten NOOIT rechtstreeks met deze module; ze gaan via
 * services/occasionService.ts, zodat je later zonder componentwijziging kunt
 * omschakelen naar bijv. GET /api/occasions/.
 *
 * TEMPLATE: onderstaande auto's zijn NETTE DEMO-VOORBEELDEN (geen echte voorraad).
 * Vervang ze per klant. Regels:
 *  - Verzin geen specs of prijzen. Onbekend = null → UI toont "op aanvraag".
 *  - FOTO'S staan in public/assets/occasions/ en worden hier gekoppeld via `photos`.
 *    Zolang `photos` leeg is, toont de UI een nette merkgebonden placeholder (geen stockfoto's).
 */

export interface OccasionPhoto {
  /** Pad naar de foto in /public, bijv. "/assets/occasions/<slug>/1.jpg" (leeg = placeholder). */
  src: string;
  /** Toegankelijke omschrijving. */
  alt: string;
}

export type Transmissie = "handgeschakeld" | "automaat";
export type BtwMarge = "marge" | "btw";

export interface Occasion {
  slug: string;
  status: OccasionStatus;
  merk: string;
  model: string;
  /** Uitvoering/variant, bijv. "1.0 TSI Comfortline". */
  uitvoering: string;
  /** Volledige titel voor kaart/detail (H1). */
  title: string;
  /** Verkoopprijs in hele euro's; null = op aanvraag. */
  prijs: number | null;
  bouwjaar: number;
  /** Eerste toelating als tekst indien preciezer bekend (bijv. "juni 2018"). */
  eersteToelating?: string;
  brandstof: string;
  transmissie: Transmissie;
  /** Aantal versnellingen indien bekend. */
  versnellingen?: number;
  carrosserie: string;
  deuren: number;
  zitplaatsen: number;
  /** Kilometerstand; null = niet vermeld / op aanvraag. */
  kmStand: number | null;
  /** Cilinderinhoud in cc; null = onbekend. */
  cilinderinhoud: number | null;
  /** Vermogen in pk; null = onbekend. */
  vermogenPk: number | null;
  /** Vermogen in kW; null = onbekend. */
  vermogenKw: number | null;
  kenteken: string;
  kleur: string;
  interieur?: string;
  /** Euro-emissieklasse indien bekend (bijv. "Euro 6"). */
  emissieklasse?: string;
  /** Marge- of btw-auto indien bekend. */
  btwMarge: BtwMarge | null;
  /** Airco aanwezig (indien bevestigd). */
  airco?: boolean;
  /** Korte, feitelijke verkooppunten. */
  highlights: string[];
  /** Eerlijke omschrijving (geen verkooppraat verzinnen). */
  description: string;
  /** Openstaande, eerlijk gemelde bijzonderheden (schade, "op aanvraag", enz.). */
  bijzonderheden?: string;
  photos: OccasionPhoto[];
}

/** DEMO-voorraad — vervang volledig door de echte occasions van de klant. */
export const occasions: Occasion[] = [
  {
    slug: "demo-volkswagen-golf-1-0-tsi-2019",
    status: "beschikbaar",
    merk: "Volkswagen",
    model: "Golf",
    uitvoering: "1.0 TSI Comfortline",
    title: "Volkswagen Golf 1.0 TSI Comfortline",
    prijs: 15950,
    bouwjaar: 2019,
    brandstof: "Benzine",
    transmissie: "handgeschakeld",
    versnellingen: 6,
    carrosserie: "Hatchback",
    deuren: 5,
    zitplaatsen: 5,
    kmStand: 82000,
    cilinderinhoud: 999,
    vermogenPk: 115,
    vermogenKw: 85,
    kenteken: "XX-000-X",
    kleur: "Grijs metallic",
    interieur: "Stof, zwart",
    emissieklasse: "Euro 6",
    btwMarge: "btw",
    airco: true,
    highlights: ["Zuinige 1.0 TSI", "Euro 6", "Airco / climate control", "Onderhoudshistorie aanwezig"],
    description:
      "DEMO-voorbeeld. Vervang deze omschrijving door de echte gegevens van de auto. Beschrijf eerlijk de staat, uitrusting en onderhoudshistorie — verzin niets.",
    photos: [], // TODO: foto's in public/assets/occasions/ zetten en hier koppelen
  },
  {
    slug: "demo-opel-corsa-1-2-2020",
    status: "gereserveerd",
    merk: "Opel",
    model: "Corsa",
    uitvoering: "1.2 Edition",
    title: "Opel Corsa 1.2 Edition",
    prijs: 13750,
    bouwjaar: 2020,
    brandstof: "Benzine",
    transmissie: "handgeschakeld",
    versnellingen: 5,
    carrosserie: "Hatchback",
    deuren: 5,
    zitplaatsen: 5,
    kmStand: 54000,
    cilinderinhoud: 1199,
    vermogenPk: 75,
    vermogenKw: 55,
    kenteken: "XX-000-Y",
    kleur: "Wit",
    interieur: "Stof, zwart",
    emissieklasse: "Euro 6",
    btwMarge: "btw",
    airco: true,
    highlights: ["Compacte stadsauto", "Zuinig", "Airco", "Lage kilometerstand"],
    description:
      "DEMO-voorbeeld met status 'gereserveerd' om de statuslabels te tonen. Vervang door echte gegevens.",
    photos: [],
  },
  {
    slug: "demo-toyota-yaris-hybrid-2018",
    status: "verkocht",
    merk: "Toyota",
    model: "Yaris",
    uitvoering: "1.5 Hybrid",
    title: "Toyota Yaris 1.5 Hybrid",
    prijs: null,
    bouwjaar: 2018,
    brandstof: "Hybride",
    transmissie: "automaat",
    carrosserie: "Hatchback",
    deuren: 5,
    zitplaatsen: 5,
    kmStand: 96000,
    cilinderinhoud: 1497,
    vermogenPk: 100,
    vermogenKw: 74,
    kenteken: "XX-000-Z",
    kleur: "Rood",
    btwMarge: "marge",
    airco: true,
    highlights: ["Zuinige hybride", "Automaat", "Margeauto"],
    description:
      "DEMO-voorbeeld met status 'verkocht'. Zo ziet een verkochte occasion eruit in het overzicht.",
    photos: [],
  },
];
