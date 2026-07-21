/**
 * FAQ — answers are built strictly from facts stated on the current site
 * (services, free inspection, guarantees, working area limited to the known
 * base location). Nothing invented. Items that would need new facts from Borre
 * are intentionally left out until confirmed. See docs/NEXT-ACTIONS.md.
 */
export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "Welke dakwerkzaamheden voeren jullie uit?",
    answer:
      "Wij verzorgen platte daken (bitumen en EPDM), pannendaken, lood- en zinkwerk, schoorstenen, dakisolatie en dakinspectie en -onderhoud. Ook renovatie en serviceonderhoud behoren tot onze werkzaamheden.",
  },
  {
    question: "Is een dakinspectie echt kosteloos?",
    answer:
      "Ja. Onze dakinspectie is kosteloos. Wij beoordelen de staat van uw dak en welke punten reparatie of renovatie nodig hebben. Desgewenst stellen wij daarna een vrijblijvende offerte op.",
  },
  {
    question: "Geven jullie garantie op het werk?",
    answer:
      "Ja. Op een compleet nieuw daksysteem (pannendak) geven wij 15 jaar garantie en op zinkwerk 10 jaar. De exacte garantie hangt af van de werkzaamheden — vraag ernaar bij uw offerte.",
  },
  {
    question: "Wat kost het vervangen of repareren van mijn dak?",
    answer:
      "Dat hangt af van het type dak, de omvang en de staat ervan. Vraag een vrijblijvende offerte aan of plan een kosteloze inspectie, dan brengen wij de situatie in kaart en ontvangt u een prijsopgave op maat.",
  },
  {
    question: "Hoe kan ik contact opnemen of een offerte aanvragen?",
    answer:
      "U kunt ons bellen of appen op 06 53252125, mailen naar info@all-indaktechniek.nl, of het offerteformulier op deze website invullen. Wij nemen dan zo snel mogelijk contact met u op.",
  },
];
