export interface Faq {
  id: string;
  question: string;
  answer: string;
}

/**
 * FAQs — neutral and honest. No prices, guarantees, response times or claims
 * that aren't confirmed. Where certainty isn't possible, we say so.
 */
export const faqs: Faq[] = [
  {
    id: "welke-daken",
    question: "Welke daken doet Roofing Center?",
    answer:
      "Wij zijn gespecialiseerd in platte daken. Denk aan bitumen dakbedekking, EPDM, renovatie, reparatie, lekkageherstel, inspectie en onderhoud.",
  },
  {
    id: "werkgebied",
    question: "In welk gebied werken jullie?",
    answer:
      "Wij werken in Almere en omgeving. Twijfelt u of uw locatie binnen ons werkgebied valt? Neem gerust contact op.",
  },
  {
    id: "lekkage",
    question: "Mijn platte dak lekt. Wat kan ik doen?",
    answer:
      "Neem bij een actieve lekkage contact met ons op, dan bespreken we de mogelijkheden. Op basis van uw situatie plannen we een inspectie. Een definitief advies is pas mogelijk na inspectie op locatie.",
  },
  {
    id: "bitumen-epdm",
    question: "Werken jullie met bitumen of EPDM?",
    answer:
      "Met beide. Bitumen wordt gebrand en in lagen aangebracht; EPDM is een rubber dakbedekking. Welk systeem het beste past, hangt af van uw dak en situatie. We adviseren u hierin.",
  },
  {
    id: "inspectie-nodig",
    question: "Kan ik meteen een prijs krijgen?",
    answer:
      "Voor een goed advies en een passende offerte is een inspectie op locatie nodig. Zo voorkomen we verrassingen en weet u waar u aan toe bent.",
  },
  {
    id: "renovatie-of-reparatie",
    question: "Is renovatie of reparatie nodig?",
    answer:
      "Dat hangt af van de staat van uw dak. Soms volstaat een gerichte reparatie, soms is renovatie verstandiger. Na een inspectie geven we hierover een eerlijk advies.",
  },
  {
    id: "assistent",
    question: "Wat is de dakassistent?",
    answer:
      "De dakassistent is een handige online hulp die u met een paar vragen door uw aanvraag begeleidt. Op basis van uw antwoorden kan Roofing Center de aanvraag beoordelen. De assistent stelt geen diagnose; dat kan pas na inspectie.",
  },
];
