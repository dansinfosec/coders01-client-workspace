/**
 * Single source of truth for BM Carservice company facts.
 * All values here are VERIFIED from the live site (bmcarservice.nl, crawl 2026-07-30)
 * unless marked `TODO: Confirm with client`. Never invent facts — unknowns stay TODO.
 * Components import from here so content can later be swapped for a CMS/API.
 */

export interface OpeningDay {
  /** Dutch day label, e.g. "Maandag". */
  day: string;
  /** 0 = Sunday … 6 = Saturday (JS getDay). */
  weekday: number;
  /** Time ranges as [openMinutes, closeMinutes] from midnight; empty = closed. */
  ranges: Array<[number, number]>;
}

const h = (hh: number, mm = 0) => hh * 60 + mm;

export const company = {
  name: "BM Carservice",
  /** VERIFIED — wordmark/gevel: "Uw veiligheid is ons beroep!". */
  slogan: "Uw veiligheid is ons beroep",
  tagline:
    "Autogarage in Amstelveen voor APK zonder afspraak, onderhoud, banden en reparatie — voor alle merken.",
  intro:
    "BM Carservice is een onafhankelijke vakgarage in Amstelveen, gespecialiseerd in onderhoud en reparatie van alle automerken. Vakmanschap, A-kwaliteit onderdelen en eerlijke prijzen — klaar terwijl u wacht.",

  phone: {
    /** Human display. */
    display: "020 – 345 1566",
    /** tel: href value. */
    href: "tel:+31203451566",
    /** wa.me / WhatsApp value (international, no +). */
    whatsapp: "31203451566",
  },
  email: "info@bmcarservice.nl",

  address: {
    street: "Bouwerij 69A",
    postalCode: "1185 XW",
    city: "Amstelveen",
    country: "NL",
    /** Google Maps directions link (public address, no personal data). */
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=BM+Carservice+Bouwerij+69A+Amstelveen",
  },

  /** ANWB alarm center number shown on the site (informational, not BM's own line). */
  anwbAlarm: "088-2692888",

  /** ma–vr 08:30–13:00 en 13:45–17:30 (VERIFIED, home). Weekend gesloten ("5 dagen per week"). */
  openingHours: [
    { day: "Maandag", weekday: 1, ranges: [[h(8, 30), h(13)], [h(13, 45), h(17, 30)]] },
    { day: "Dinsdag", weekday: 2, ranges: [[h(8, 30), h(13)], [h(13, 45), h(17, 30)]] },
    { day: "Woensdag", weekday: 3, ranges: [[h(8, 30), h(13)], [h(13, 45), h(17, 30)]] },
    { day: "Donderdag", weekday: 4, ranges: [[h(8, 30), h(13)], [h(13, 45), h(17, 30)]] },
    { day: "Vrijdag", weekday: 5, ranges: [[h(8, 30), h(13)], [h(13, 45), h(17, 30)]] },
    { day: "Zaterdag", weekday: 6, ranges: [] },
    { day: "Zondag", weekday: 0, ranges: [] },
  ] as OpeningDay[],

  /** Verkorte weergave voor footer/hero. */
  openingSummary: "Ma–vr 08:30–17:30 · weekend gesloten",

  social: {
    // Alleen X/Twitter is bevestigd op de huidige site.
    twitter: "https://twitter.com/BmCarservice",
  },

  serviceArea: ["Amstelveen", "Amsterdam", "Aalsmeer", "Uithoorn"],

  /** Kernvoordelen zoals op de homepage (VERIFIED). */
  usps: [
    "Gratis APK bij een grote beurt",
    "Klaar terwijl u wacht",
    "Gratis vervangend vervoer",
    "RDW-gecertificeerd",
    "Alle merken",
    "Eerlijke, lage prijzen",
  ],

  /** Trust-/kwalificatiesignalen (VERIFIED van de site). */
  trust: [
    { label: "RDW-erkend", detail: "Gecertificeerde keuringsinstantie" },
    { label: "ANWB Partnerbedrijf", detail: "Pechhulp conform Wegenwacht" },
    { label: "36 mnd garantie", detail: "Op alle reparaties" },
    { label: "A-kwaliteit onderdelen", detail: "Bosch · Brembo · Valeo · Gates" },
  ],

  // TODO: Confirm with client
  kvk: null as string | null, // niet op de site vermeld
  vat: null as string | null,
  appointmentEndpoint: import.meta.env.VITE_APPOINTMENT_ENDPOINT ?? "", // leeg = frontend-only
} as const;

export type Company = typeof company;
