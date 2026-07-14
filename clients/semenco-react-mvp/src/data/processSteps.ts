import type { ProcessStep } from "@/types/content";

/**
 * The registration & intake process — verified from the live /aanmelden page
 * (6 steps). Lightly rewritten for clarity; factual meaning unchanged.
 */
export const processSteps: ProcessStep[] = [
  {
    id: "aanmelden",
    order: 1,
    title: "Aanmelden",
    description:
      "Vul het aanmeldformulier in of neem contact op. Vertel kort wat je kind nodig heeft en waar jullie tegenaan lopen.",
  },
  {
    id: "kennismaking",
    order: 2,
    title: "Kennismaking",
    description:
      "We plannen een kennismaking, telefonisch of op locatie. We bespreken de hulpvraag, prikkelgevoeligheid, ontwikkelingsleeftijd en wat voor jullie belangrijk is.",
  },
  {
    id: "voorstel",
    order: 3,
    title: "Voorstel en match",
    description:
      "Als we denken dat Sem & Co passend kan zijn, maken we een voorstel. We kijken ook welke bungalow of groep het beste aansluit bij jouw kind.",
  },
  {
    id: "spelmiddag",
    order: 4,
    title: "Vrijblijvende spelmiddag",
    description:
      "Daarna plannen we een laagdrempelige, ontspannen spelmiddag. We kijken hoe je kind binnenkomt, wat helpend is en of er een klik is.",
  },
  {
    id: "intake",
    order: 5,
    title: "Intakeformulier",
    description:
      "Na de spelmiddag ontvang je het intakeformulier, zodat we alle belangrijke informatie compleet hebben: routines, prikkels, veiligheid en communicatie.",
  },
  {
    id: "start",
    order: 6,
    title: "Proeflogeren of direct starten",
    description:
      "Soms is proeflogeren fijn om rustig op te bouwen, soms voelt het meteen goed. We stemmen dit samen af, altijd op het tempo van het kind.",
  },
];
