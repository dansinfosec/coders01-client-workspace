/**
 * Single source of truth for Two in one barberstudio (Rijswijk).
 *
 * SOURCING:
 *  - Google Maps (Places API New) — VERIFIED business (displayName, Visseringlaan
 *    19 / Rijswijk, coords 52.0379497,4.3328132): name, address, phone, opening
 *    hours, rating, review count, reviews, Google Maps link, photos.
 *  - Setmore — services, prices, booking links, email.
 *
 *  NOTE: Google lists phone 06 48539573; the Setmore page shows a different
 *  number. Google is authoritative for NAP, so 06 48539573 is used as the primary
 *  contact number. Nothing is invented.
 */

export const business = {
  name: "Two in one barberstudio",
  city: "Rijswijk",

  // --- Google Maps (authoritative NAP) ---
  address: {
    street: "Visseringlaan 19",
    postalCode: "2288 ER",
    city: "Rijswijk",
    country: "Nederland",
  },
  phone: { display: "06 48539573", href: "tel:+31648539573" },
  googleMapsUrl: "https://maps.google.com/?cid=15379698788211189878",
  rating: 5.0,
  reviewCount: 45,

  // --- Setmore ---
  email: "e.rd123@hotmail.com",
  booking: {
    base: "https://two-in-one-barberstudio.setmore.com/book",
    home: "https://two-in-one-barberstudio.setmore.com/",
  },

  // --- Opening hours: Google Maps (Europe/Amsterdam). dayIndex 0 = Sunday. ---
  // ranges: [openMinutes, closeMinutes], or null = closed.
  hours: [
    { dayIndex: 0, label: "Zondag", range: null },
    { dayIndex: 1, label: "Maandag", range: [12 * 60, 20 * 60] },
    { dayIndex: 2, label: "Dinsdag", range: [10 * 60, 20 * 60] },
    { dayIndex: 3, label: "Woensdag", range: [10 * 60, 20 * 60] },
    { dayIndex: 4, label: "Donderdag", range: [10 * 60, 20 * 60] },
    { dayIndex: 5, label: "Vrijdag", range: [10 * 60, 20 * 60] },
    { dayIndex: 6, label: "Zaterdag", range: [10 * 60, 20 * 60] },
  ] as { dayIndex: number; label: string; range: [number, number] | null }[],
} as const;

export const fullAddress = `${business.address.street}, ${business.address.postalCode} ${business.address.city}`;

/** Google Maps directions link (route to the shop). */
export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(`${fullAddress}, ${business.address.country}`);
