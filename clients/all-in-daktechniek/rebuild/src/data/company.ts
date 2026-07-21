/**
 * Single source of truth for All-in Daktechniek company facts.
 *
 * RULE (Coders01): never invent business facts. Every value below is taken
 * verbatim from the live site (all-indaktechniek.nl, inspected 2026-07-21).
 * Unknown values are left empty with a `TODO: Confirm with client` note and are
 * hidden in the UI until Borre confirms them. See docs/NEXT-ACTIONS.md.
 */

export interface ClaimWithSource {
  /** Human-readable value exactly as it appears on the current site. */
  value: string;
  /** Where on the current site this claim comes from. */
  source: string;
}

export const company = {
  name: "All-in Daktechniek",
  legalName: "All-in Daktechniek",
  tagline: "De dakdekker met ervaring", // from current site title (placeholder text removed)
  contactPerson: "Borre Van der Wal",

  // Confirmed NAP — from footer + /contact/ on the live site.
  address: {
    street: "Stationsweg 53",
    postalCode: "2675 AM",
    city: "Honselersdijk",
    country: "Nederland",
  },

  phonePrimary: { display: "06 53252125", href: "tel:+31653252125" },
  // Second number shown on the current site; purpose unlabelled there.
  phoneSecondary: { display: "06 42059084", href: "tel:+31642059084" },

  whatsapp: { display: "WhatsApp", href: "https://wa.me/31653252125" },
  email: "info@all-indaktechniek.nl",
  kvk: "73998400",

  social: {
    facebook: "https://www.facebook.com/All.in.Daktechniek/",
  },

  // Real trust facts stated on the current site. Kept as claim+source so the UI
  // can show them factually without turning them into invented company-wide
  // promises. NOTE: the site itself is internally inconsistent on guarantee and
  // experience — do NOT resolve this here; Borre must confirm (NEXT-ACTIONS).
  trust: {
    teamSize: { value: "Team van 6 dakdekkers", source: "homepage" } as ClaimWithSource,
    experience: { value: "Gemiddeld 20 jaar ervaring", source: "homepage" } as ClaimWithSource,
    vca: { value: "In het bezit van VCA-certificaat", source: "homepage" } as ClaimWithSource,
    freeInspection: { value: "Kosteloze dakinspectie", source: "inspectie-pagina" } as ClaimWithSource,
  },

  // Guarantee claims differ PER service on the current site. Stored per service
  // in data/services.ts, never as one blanket number. See CONTENT-INVENTORY.md.

  // Unknowns — hidden in the UI until confirmed by the client.
  openingHours: null as null | { day: string; hours: string }[], // TODO: Confirm with client
  reviews: null, // TODO: Confirm with client — no reviews on current site
  googleMapsEmbedUrl: null as string | null, // TODO: Confirm with client

  cta: {
    quote: "Offerte aanvragen",
    call: "Bel ons",
    whatsapp: "WhatsApp",
    discuss: "Neem contact op",
  },
} as const;

export const fullAddress = `${company.address.street}, ${company.address.postalCode} ${company.address.city}`;
