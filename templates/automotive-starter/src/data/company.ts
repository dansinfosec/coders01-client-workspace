/**
 * Single source of truth voor de bedrijfsféiten van de klant.
 *
 * TEMPLATE: alle waarden hieronder zijn NETTE PLACEHOLDERS — geen echte gegevens.
 * Vervang ze per klant en verwijder de `TODO`-markeringen zodra bevestigd.
 * Regel: verzin nooit feiten. Onbekend = `null` of leeg met een expliciete TODO.
 *
 * Visuele identiteit staat in `config/brand.ts`, modules in `config/features.ts`,
 * SEO-defaults in `config/site.ts`.
 */

export interface OpeningDay {
  /** Nederlandse daglabel, bijv. "Maandag". */
  day: string;
  /** 0 = zondag … 6 = zaterdag (JS getDay). */
  weekday: number;
  /** Tijdvakken als [openMinuten, sluitMinuten] vanaf middernacht; leeg = gesloten. */
  ranges: Array<[number, number]>;
}

const h = (hh: number, mm = 0) => hh * 60 + mm;

export const company = {
  name: "Autobedrijf Voorbeeld", // TODO: echte bedrijfsnaam

  /** Placeholder-slogan. */
  slogan: "Uw vertrouwde adres voor APK, onderhoud en occasions",
  tagline:
    "Onafhankelijke vakgarage voor alle merken. APK, onderhoud, reparatie, airco, banden en occasions — onder één dak.",
  intro:
    "Onze onafhankelijke vakgarage staat voor persoonlijke aandacht en eerlijk advies. Wij werken aan alle merken — van APK en onderhoud tot reparatie, airco, banden en occasions.",

  /** Oprichtingsjaar; null = niet tonen. TODO: invullen indien bekend. */
  foundedYear: null as number | null,

  phone: {
    display: "00 – 000 00 00", // TODO: echt telefoonnummer
    href: "tel:+3100000000",
  },
  /** Optioneel mobiel nummer; null = niet tonen. */
  mobile: null as { display: string; href: string } | null,

  email: "info@example.com", // TODO: echt e-mailadres

  address: {
    street: "Voorbeeldstraat 1", // TODO
    postalCode: "1234 AB", // TODO
    city: "Voorbeeldstad", // TODO
    country: "NL",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Autobedrijf+Voorbeeld", // TODO
  },

  /** Placeholder-openingstijden — vervang per klant. */
  openingHours: [
    { day: "Maandag", weekday: 1, ranges: [[h(8), h(18)]] },
    { day: "Dinsdag", weekday: 2, ranges: [[h(8), h(18)]] },
    { day: "Woensdag", weekday: 3, ranges: [[h(8), h(18)]] },
    { day: "Donderdag", weekday: 4, ranges: [[h(8), h(18)]] },
    { day: "Vrijdag", weekday: 5, ranges: [[h(8), h(18)]] },
    { day: "Zaterdag", weekday: 6, ranges: [[h(9), h(13)]] },
    { day: "Zondag", weekday: 0, ranges: [] },
  ] as OpeningDay[],

  openingSummary: "Ma–vr 08:00–18:00 · za 09:00–13:00 · zo gesloten",

  /** Social links; null = weglaten. TODO per klant. */
  social: {
    facebook: null as string | null,
    instagram: null as string | null,
  },

  /** Primair verzorgingsgebied. */
  serviceArea: ["Voorbeeldstad"], // TODO

  /** Kernvoordelen — placeholder, vervang met geverifieerde USP's. */
  usps: [
    "Onafhankelijke vakgarage",
    "Voor alle merken",
    "Persoonlijke aandacht en eerlijk advies",
    "RDW-erkende APK-keurmeesters",
    "Vervangend vervoer in overleg",
    "Duidelijke afspraken vooraf",
  ],

  /**
   * Optionele, bevestigde actie (voorbeeld). null = geen actie tonen.
   * TODO: alleen tonen wat de klant daadwerkelijk aanbiedt.
   */
  offer: {
    label: "Gratis APK bij een grote onderhoudsbeurt",
    short: "Gratis APK bij een grote beurt",
  } as { label: string; short: string } | null,

  /**
   * WhatsApp-kanaal — alleen zichtbaar als features.whatsapp = true.
   * `number` = internationaal zonder plusteken (voor wa.me).
   * TODO: echt WhatsApp-nummer invullen vóór je de vlag aanzet.
   */
  whatsapp: {
    number: "3100000000",
    display: "00 – 000 00 00",
    href: "https://wa.me/3100000000",
    provisional: true,
  } as { number: string; display: string; href: string; provisional: boolean } | null,

  // --- Onbekend tot bevestigd (niet tonen) ---
  rating: null as { score: number; source: string; url: string } | null,
  kvk: null as string | null,
  vat: null as string | null,

  /** Leeg = frontend-only mock. Zie services/planningService + services/vehicleSaleService. */
  appointmentEndpoint: import.meta.env.VITE_APPOINTMENT_ENDPOINT ?? "",
  vehicleSaleEndpoint: import.meta.env.VITE_VEHICLE_SALE_ENDPOINT ?? "",
} as const;

export type Company = typeof company;
