import type { OpeningDay } from "./company";

/**
 * Central location model for BM Carservice.
 *
 * Data integrity: only the Amstelveen HQ is VERIFIED (crawl + business registers, 2026-07-30).
 * BM Carservice publicly operates ONE physical garage (Bouwerij 69A, Amstelveen); the cities
 * Amsterdam/Aalsmeer/Uithoorn are marketed service AREAS, not separate branches.
 *
 * The two extra branches below are DEMO placeholders (`isPlaceholder: true`) so the multi-branch
 * architecture is complete and testable. Their address / phone / hours / maps are TODO and must
 * be confirmed with the client before go-live. Nothing here is presented in the UI as a real fact
 * without the placeholder badge. Never hardcode branch data in components — import from here.
 */

export type OpeningHours = OpeningDay[];

export interface Location {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  postalCode: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  openingHours: OpeningHours;
  googleMapsUrl?: string;
  mapEmbedUrl?: string;
  latitude?: number;
  longitude?: number;
  /** Werkzaamheid ids offered here (see data/werkzaamheden.ts). */
  services: string[];
  specialties?: string[];
  appointmentEnabled: boolean;
  calendarId?: string;
  /** true = demo branch; real operational data still to be confirmed with the client. */
  isPlaceholder: boolean;
}

const h = (hh: number, mm = 0) => hh * 60 + mm;

const weekdays = (ranges: Array<[number, number]>): OpeningHours => [
  { day: "Maandag", weekday: 1, ranges },
  { day: "Dinsdag", weekday: 2, ranges },
  { day: "Woensdag", weekday: 3, ranges },
  { day: "Donderdag", weekday: 4, ranges },
  { day: "Vrijdag", weekday: 5, ranges },
];

const mapsSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const mapsEmbed = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

// All confirmed werkzaamheid ids (Amstelveen offers the full range).
const ALL_SERVICES = [
  "apk-keuring", "kleine-beurt", "grote-beurt", "jaarlijkse-beurt", "airco-onderhoud",
  "diagnose", "ev-servicebeurt", "bandenwissel-set", "bandenwissel-los", "reparatie",
  "wintercheck", "zomercheck", "aircocheck", "anders",
];

export const locations: Location[] = [
  {
    id: "amstelveen",
    slug: "amstelveen",
    name: "BM Carservice Amstelveen",
    city: "Amstelveen",
    address: "Bouwerij 69A",
    postalCode: "1185 XW",
    phone: "020 – 345 1566",
    whatsapp: "31203451566",
    email: "info@bmcarservice.nl",
    openingHours: [
      ...weekdays([[h(8, 30), h(13)], [h(13, 45), h(17, 30)]]),
      { day: "Zaterdag", weekday: 6, ranges: [] },
      { day: "Zondag", weekday: 0, ranges: [] },
    ],
    googleMapsUrl: mapsSearch("BM Carservice, Bouwerij 69A, 1185 XW Amstelveen"),
    mapEmbedUrl: mapsEmbed("BM Carservice, Bouwerij 69A, 1185 XW Amstelveen"),
    // latitude/longitude: TODO confirm exact coordinates with client.
    services: ALL_SERVICES,
    specialties: ["APK zonder afspraak", "Distributieketting VW/Audi/Seat/Skoda", "ANWB Partnerbedrijf"],
    appointmentEnabled: true,
    calendarId: undefined, // TODO: real workshop calendar id
    isPlaceholder: false,
  },
  {
    // DEMO placeholder — data to be confirmed with the client.
    id: "amsterdam",
    slug: "amsterdam",
    name: "BM Carservice Amsterdam",
    city: "Amsterdam",
    address: "TODO: straat + nummer",
    postalCode: "TODO",
    phone: undefined, // TODO
    whatsapp: undefined, // TODO
    email: undefined, // TODO
    // Demo hours (incl. zaterdagochtend) to show per-branch differences — TODO confirm.
    openingHours: [
      ...weekdays([[h(8, 0), h(12, 30)], [h(13, 30), h(18)]]),
      { day: "Zaterdag", weekday: 6, ranges: [[h(9), h(13)]] },
      { day: "Zondag", weekday: 0, ranges: [] },
    ],
    googleMapsUrl: mapsSearch("BM Carservice Amsterdam"),
    services: ["apk-keuring", "kleine-beurt", "grote-beurt", "airco-onderhoud", "diagnose", "bandenwissel-set", "bandenwissel-los", "reparatie", "wintercheck", "zomercheck", "aircocheck", "anders"],
    specialties: ["APK zonder afspraak"],
    appointmentEnabled: true,
    calendarId: undefined,
    isPlaceholder: true,
  },
  {
    // DEMO placeholder — data to be confirmed with the client.
    id: "aalsmeer",
    slug: "aalsmeer",
    name: "BM Carservice Aalsmeer",
    city: "Aalsmeer",
    address: "TODO: straat + nummer",
    postalCode: "TODO",
    phone: undefined, // TODO
    whatsapp: undefined, // TODO
    email: undefined, // TODO
    // Demo hours (gesloten op woensdag) to show per-branch differences — TODO confirm.
    openingHours: [
      { day: "Maandag", weekday: 1, ranges: [[h(8, 30), h(17)]] },
      { day: "Dinsdag", weekday: 2, ranges: [[h(8, 30), h(17)]] },
      { day: "Woensdag", weekday: 3, ranges: [] },
      { day: "Donderdag", weekday: 4, ranges: [[h(8, 30), h(17)]] },
      { day: "Vrijdag", weekday: 5, ranges: [[h(8, 30), h(17)]] },
      { day: "Zaterdag", weekday: 6, ranges: [] },
      { day: "Zondag", weekday: 0, ranges: [] },
    ],
    googleMapsUrl: mapsSearch("BM Carservice Aalsmeer"),
    services: ["apk-keuring", "kleine-beurt", "grote-beurt", "jaarlijkse-beurt", "bandenwissel-set", "bandenwissel-los", "reparatie", "wintercheck", "zomercheck", "anders"],
    specialties: ["Bandenservice"],
    appointmentEnabled: true,
    calendarId: undefined,
    isPlaceholder: true,
  },
];

export const defaultLocation = locations[0]!;

export const getLocation = (slugOrId: string): Location | undefined =>
  locations.find((l) => l.slug === slugOrId || l.id === slugOrId);

/** Short address line, e.g. "Bouwerij 69A, 1185 XW Amstelveen". */
export const locationAddressLine = (l: Location): string =>
  l.isPlaceholder ? `${l.city} — adres nog te bevestigen` : `${l.address}, ${l.postalCode} ${l.city}`;
