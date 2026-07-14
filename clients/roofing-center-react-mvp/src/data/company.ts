/**
 * Central company configuration — the single source of truth for Roofing Center.
 *
 * NOTHING here is invented. Unknown fields are empty strings marked with
 * `// TODO: Confirm with client`. The UI hides contact channels that are empty
 * (no fake phone numbers, no fake reviews, no fake guarantees). See ASSET_ANALYSIS.md.
 */

export interface ConfirmedService {
  slug: string;
  title: string;
  short: string;
}

export const company = {
  name: "Roofing Center",
  legalName: "", // TODO: Confirm with client (statutaire naam)
  tagline: "Specialist in platte daken",
  claim: "Uw specialist in dakwerken", // from the official logo
  serviceArea: "Almere en omgeving",
  serviceAreaLong: "Almere en omgeving (Flevoland en 't Gooi)", // TODO: Confirm exact werkgebied

  // --- Contact (UI hides any channel left empty — never shows a fake value) ---
  phone: "", // TODO: Confirm with client (e.g. +31 6 ...)
  phoneDisplay: "", // TODO: Confirm with client
  email: "", // TODO: Confirm with client
  whatsapp: "", // TODO: Confirm with client (international format, e.g. 3161234567)
  address: {
    street: "", // TODO: Confirm with client
    postalCode: "", // TODO: Confirm with client
    city: "Almere", // service base — TODO: Confirm exact vestigingsplaats
    country: "Nederland",
  },

  // --- External links (centralized) ---
  googleMapsUrl: "", // TODO: Confirm with client (Google Bedrijfsprofiel URL voor reviews)
  googleReviewsUrl: "", // TODO: Confirm with client
  social: {
    facebook: "", // TODO: Confirm with client
    instagram: "", // TODO: Confirm with client
    linkedin: "", // TODO: Confirm with client
  },

  // --- Business info (do NOT fabricate) ---
  kvk: "", // TODO: Confirm with client
  btw: "", // TODO: Confirm with client
  businessHours: [
    // TODO: Confirm with client — left generic and clearly unconfirmed
    { day: "Maandag t/m vrijdag", hours: "Op afspraak" },
    { day: "Weekend", hours: "Op afspraak" },
  ],

  // --- Confirmed services (visible in the supplied project photos) ---
  confirmedServices: [
    { slug: "bitumen-dakbedekking", title: "Bitumen dakbedekking", short: "Gebrand bitumen dakbedekking voor platte daken." },
    { slug: "dakrenovatie", title: "Renovatie van platte daken", short: "Volledige vernieuwing van uw platte dak." },
    { slug: "dakreparatie", title: "Reparatie van platte daken", short: "Gericht herstel van schade en zwakke plekken." },
    { slug: "daklekkage", title: "Daklekkage herstellen", short: "Opsporen en verhelpen van lekkages." },
    { slug: "dakinspectie", title: "Dakinspectie", short: "Beoordeling van de staat van uw platte dak." },
    { slug: "dakonderhoud", title: "Preventief dakonderhoud", short: "Onderhoud om problemen voor te zijn." },
    { slug: "waterdicht-maken", title: "Waterdicht maken", short: "Waterdichte afwerking van platte daken." },
  ] satisfies ConfirmedService[],

  // --- Materials shown in the photos (in scope for flat roofs) ---
  materials: ["Bitumen (gebrand)", "EPDM"],

  // --- Unconfirmed services — NOT published as fact, kept for confirmation ---
  unconfirmedServices: [
    // TODO: Confirm with client — no insulation boards are clearly visible in the photos.
    { slug: "dakisolatie", title: "Dakisolatie", short: "Isolatie van platte daken.", reason: "Niet duidelijk zichtbaar op aangeleverde foto's." },
  ],

  // --- CTA copy (Dutch, public-facing) ---
  cta: {
    primary: "Vraag een vrijblijvende dakinspectie aan",
    quote: "Offerte aanvragen",
    call: "Bel direct",
    whatsapp: "Stuur een WhatsApp-bericht",
    discuss: "Bespreek uw dakprobleem",
    assistant: "Start de dakassistent",
  },
} as const;

/** Whether a given contact channel is configured (used to hide empty channels). */
export const contact = {
  hasPhone: company.phone.trim().length > 0,
  hasWhatsapp: company.whatsapp.trim().length > 0,
  hasEmail: company.email.trim().length > 0,
  hasAddress: company.address.street.trim().length > 0,
  hasMaps: company.googleMapsUrl.trim().length > 0,
  hasReviews: company.googleReviewsUrl.trim().length > 0,
};

/** WhatsApp deep link (empty when not configured). */
export function whatsappLink(prefill?: string): string {
  if (!contact.hasWhatsapp) return "";
  const base = `https://wa.me/${company.whatsapp}`;
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
}

/** tel: link (empty when not configured). */
export function telLink(): string {
  return contact.hasPhone ? `tel:${company.phone.replace(/\s|\(|\)/g, "")}` : "";
}
