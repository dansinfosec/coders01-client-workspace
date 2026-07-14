import type { Faq } from "@/types/content";

/**
 * FAQs. Only `verified: true` items are rendered publicly (see `publishedFaqs`).
 * Verified answers are sourced from the live site; unverified ones are kept here
 * for the client to confirm and are never shown as fact.
 */
export const faqs: Faq[] = [
  {
    id: "voor-wie",
    question: "Voor wie is Sem & Co bedoeld?",
    answer:
      "Voor kinderen en jongeren van 4 tot 18 jaar met extra ondersteuningsbehoeften.",
    verified: true,
  },
  {
    id: "logeerweekend",
    question: "Wanneer is een logeerweekend?",
    answer:
      "Een logeerweekend loopt van vrijdag vanaf 17:00 uur tot zondag uiterlijk 17:00 uur.",
    verified: true,
  },
  {
    id: "groepsgrootte",
    question: "Hoe groot zijn de groepen?",
    answer:
      "We werken kleinschalig: maximaal vijf kinderen per bungalow, verdeeld over vier bungalows.",
    verified: true,
  },
  {
    id: "vrijblijvend",
    question: "Is aanmelden vrijblijvend?",
    answer:
      "Ja. Aanmelden is een eerste stap en volledig vrijblijvend. Daarna kijken we samen wat passend is.",
    verified: true,
  },
  {
    id: "crisis-duur",
    question: "Hoe lang duurt crisisopvang?",
    answer: "Crisisopvang is tijdelijk en duurt maximaal vier weken.",
    verified: true,
  },
  {
    id: "locatie",
    question: "Waar zijn jullie gevestigd?",
    answer: "Op vakantiepark RCN Het Grote Bos in Doorn.",
    verified: true,
  },
  {
    // Unverified — funding routes are named on the site, but eligibility and the
    // exact procedure are NOT confirmed. Kept internal until the client confirms.
    id: "vergoeding",
    question: "Hoe zit het met vergoeding en verwijzing?",
    answer:
      "Aanmelding en verwijzing kunnen via de gemeente (Jeugdwet) of het zorgkantoor (WLZ) lopen. De exacte mogelijkheden bespreken we graag — neem contact op. (Nog te bevestigen met de klant.)",
    verified: false,
  },
];

/** Only the publicly-shown, verified FAQs. */
export const publishedFaqs = faqs.filter((f) => f.verified);
