/**
 * Single source of truth for Gentleman's Touch.
 *
 * SOURCING RULES (per brief):
 *  - Google Maps (Places API New) is the source for: address, phone, opening
 *    hours, rating, review count, Google Maps link.
 *  - Setmore is the source for: services, prices, booking links, email.
 *  - Public brand name is "Gentleman's Touch" (confirmed on the storefront sign
 *    "GENTLEMAN'S TOUCH — LUXURY MEN'S GROOMING"). Legacy/source names
 *    (Two-in-one-barberstudio, 2&1 Barber Studio, Fusion Pigment Barber Studio)
 *    are NOT shown publicly. See ../../docs for the branding-mismatch report.
 *
 *  ⚠ SOURCE MISMATCH (flagged for owner): the Setmore booking page lists a
 *  Rijswijk address + a different phone (+31 6 47747131). Google lists Vlaardingen
 *  + 06 42507856. Per the brief, Google is authoritative for location/phone; the
 *  Setmore booking flow is kept as-is. Owner must confirm which is current.
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

  // --- Setmore (booking + email) ---
  email: "e.rd123@hotmail.com",
  booking: {
    // Setmore booking host carries a legacy account name; only used as an href,
    // never shown as visible text on the frontend.
    base: "https://two-in-one-barberstudio.setmore.com/book",
    home: "https://two-in-one-barberstudio.setmore.com/",
  },

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

  // NOTE: an Instagram handle (@2in1BarberStudio) appears on the legacy logo
  // artwork, but it exposes a legacy brand name, so it is intentionally NOT
  // surfaced on the frontend. Confirm the correct public social handles with owner.
} as const;

export const fullAddress = `${business.address.street}, ${business.address.postalCode} ${business.address.city}`;

/** Google Maps directions link (route to the shop). */
export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(`${fullAddress}, ${business.address.country}`);
