/**
 * Single source of truth for Gentleman's Touch (Vlaardingen).
 *
 * SOURCING:
 *  - Google Maps (Places API New) is the source for: name, address, phone,
 *    opening hours, rating, review count, Google Maps link.
 *  - Public brand name "Gentleman's Touch" is confirmed on the storefront sign
 *    ("GENTLEMAN'S TOUCH — LUXURY MEN'S GROOMING").
 *
 *  BOOKING: no online booking system is confirmed for Gentleman's Touch yet.
 *  Until the owner confirms one, appointment call-to-actions fall back to calling
 *  the shop ("Afspraak aanvragen" → tel:). Do NOT link any external booking page.
 *
 *  Nothing here is invented. Unknown values are omitted, not guessed.
 */

export const business = {
  name: "Gentleman's Touch",
  tagline: "Luxury Men's Grooming", // real — from the storefront sign (Google photo)
  city: "Vlaardingen",

  // --- Google Maps (authoritative for location/contact) ---
  address: {
    street: "Fransenstraat 27",
    postalCode: "3131 CC",
    city: "Vlaardingen",
    country: "Nederland",
  },
  phone: { display: "06 42507856", href: "tel:+31642507856" },
  googleMapsUrl: "https://maps.google.com/?cid=37393818300176626",
  googleReviewsUrl: "https://maps.google.com/?cid=37393818300176626",
  rating: 4.9,
  reviewCount: 97,

  // Booking: online booking not yet confirmed. `online: false` makes CTAs fall
  // back to the phone. Confirm the correct booking system with the owner.
  booking: { online: false },

  // --- Opening hours: Google Maps (Europe/Amsterdam). dayIndex 0 = Sunday. ---
  // ranges: [openMinutes, closeMinutes] from midnight, or null = closed.
  hours: [
    { dayIndex: 0, label: "Zondag", range: [11 * 60, 17 * 60] },
    { dayIndex: 1, label: "Maandag", range: [9 * 60, 18 * 60] },
    { dayIndex: 2, label: "Dinsdag", range: [9 * 60, 18 * 60] },
    { dayIndex: 3, label: "Woensdag", range: [9 * 60, 18 * 60] },
    { dayIndex: 4, label: "Donderdag", range: [9 * 60, 18 * 60] },
    { dayIndex: 5, label: "Vrijdag", range: [9 * 60, 20 * 60] },
    { dayIndex: 6, label: "Zaterdag", range: [9 * 60, 18 * 60] },
  ] as { dayIndex: number; label: string; range: [number, number] | null }[],
} as const;

export const fullAddress = `${business.address.street}, ${business.address.postalCode} ${business.address.city}`;

/** Google Maps directions link (route to the shop). */
export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(`${fullAddress}, ${business.address.country}`);

/** Label used for appointment CTAs while online booking is unavailable. */
export const BOOK_LABEL = "Afspraak aanvragen";
