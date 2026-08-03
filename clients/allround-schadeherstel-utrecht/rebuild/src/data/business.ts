/**
 * Single source of truth for Allround Schadeherstel Utrecht.
 *
 * SOURCING — Google Places API (New), verified against the supplied Maps profile
 * (name + coordinates + CID + Place ID all matched). See docs/SOURCE-REPORT.md.
 *   - Trade name is "Allround Schadeherstel Utrecht".
 *   - The verified physical address is in WOERDEN (not Utrecht city). The trade
 *     name is kept as-is; NAP, contact, local SEO and JSON-LD use the real place.
 *   - No website, rating or reviews were returned by the listing -> none are
 *     shown or invented. Unknown values are omitted, never guessed.
 *
 * Nothing here is fabricated. Everything the owner must still confirm before
 * production is listed in rebuild/PREVIEW-NOTE.md.
 */

export interface OpeningHour {
  dayIndex: number; // 0 = Sunday … 6 = Saturday
  label: string;
  /** [openMinutes, closeMinutes] from midnight, or null = closed. */
  range: [number, number] | null;
}

export const business = {
  name: "Allround Schadeherstel Utrecht",
  displayName: "Allround Schadeherstel Utrecht",
  shortName: "Allround Schadeherstel",

  // --- Google Places (authoritative for location/contact) ---
  placeId: "ChIJtV9cUaR5xkcRqG376gna4Ck",
  address: {
    street: "Bierbrouwersweg 15",
    postalCode: "3449 HW",
    city: "Woerden",
    country: "Nederland",
  },
  phone: { display: "06 49402698", href: "tel:+31649402698" },
  email: null as string | null, // not verified on the listing
  website: null as string | null, // no website on the listing (this MVP is the first)

  googleMapsUrl: "https://maps.google.com/?cid=3017651486470139304",
  coordinates: { lat: 52.0852319, lng: 4.8602122 },

  businessStatus: "OPERATIONAL",

  // No rating / review count returned by the verified listing -> keep null so
  // the UI shows nothing rather than a fabricated score.
  rating: null as number | null,
  reviewCount: null as number | null,

  // --- Opening hours: Google Places (Europe/Amsterdam). dayIndex 0 = Sunday. ---
  hours: [
    { dayIndex: 0, label: "Zondag", range: null },
    { dayIndex: 1, label: "Maandag", range: [8 * 60, 17 * 60] },
    { dayIndex: 2, label: "Dinsdag", range: [8 * 60, 17 * 60] },
    { dayIndex: 3, label: "Woensdag", range: [8 * 60, 17 * 60] },
    { dayIndex: 4, label: "Donderdag", range: [8 * 60, 17 * 60] },
    { dayIndex: 5, label: "Vrijdag", range: [8 * 60 + 30, 17 * 60] },
    { dayIndex: 6, label: "Zaterdag", range: null },
  ] as OpeningHour[],

  // Neighbouring places within a credible catchment around Woerden. Presented as
  // "regio", not as guaranteed coverage.
  serviceAreas: [
    "Woerden",
    "Utrecht",
    "Harmelen",
    "De Meern",
    "Montfoort",
    "Oudewater",
    "Bodegraven",
    "Kamerik",
  ],

  vehicleCategories: ["Auto", "Motor", "Scooter", "Boot"],

  /**
   * Lead / form submission configuration. In preview mode the form runs a demo
   * flow and sends nothing. Point `endpoint` at a real handler and switch
   * `submitMode` to "endpoint" once a backend exists (see PREVIEW-NOTE.md).
   */
  leadConfig: {
    submitMode: "demo" as "demo" | "endpoint",
    endpoint: null as string | null,
    // WhatsApp is intentionally disabled: the number is a mobile line but the
    // owner has NOT confirmed it is a WhatsApp business line. Enable only after
    // confirmation.
    whatsapp: { enabled: false, href: null as string | null },
  },
} as const;

export const fullAddress =
  `${business.address.street}, ${business.address.postalCode} ${business.address.city}`;

/** Google Maps directions link (route to the workshop). */
export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(`${fullAddress}, ${business.address.country}`) +
  `&destination_place_id=${business.placeId}`;

/** Primary lead call-to-action label used across the site. */
export const CTA_LABEL = "Schade laten beoordelen";
