import type { ContactDetails } from "@/types/content";

/**
 * Contact details.
 * - Visiting ADDRESS is verified from the live site (crisisopvang page).
 * - Phone and e-mail are NOT verified: the live /contact page is behind bot
 *   verification, so they are `null` and hidden in the UI (no fake values).
 * See TODO.md → Content and scraped-data/reports/content-inventory.md.
 */
export const contactDetails: ContactDetails = {
  organisation: "Sem & Co",
  locationName: "RCN Het Grote Bos",
  email: null, // to be verified with the client
  phone: null, // to be verified with the client
  address: {
    street: "Hydeparkplaan 24",
    postalCode: "3941 ZK",
    city: "Doorn",
    country: "Nederland",
    verified: true,
  },
};
