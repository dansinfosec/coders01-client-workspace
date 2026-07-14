import { LifeBuoy, Moon, Sun } from "lucide-react";
import type { Service } from "@/types/content";
import { ROUTES } from "@/routes/paths";

/**
 * Care services — content verified from the live site
 * (see scraped-data/reports/content-inventory.md). All three are confirmed
 * offerings: logeerweekenden, vakantieweken and (temporary) crisisopvang.
 */
export const careServices: Service[] = [
  {
    id: "logeeropvang",
    to: ROUTES.logeeropvang,
    title: "Logeeropvang",
    summary:
      "Kleinschalige logeerweekenden in een huiselijke omgeving: maximaal vijf kinderen per bungalow, met rust, structuur en echte aandacht.",
    icon: Moon,
    verified: true,
    intro: [
      "Sem & Co is een warme en huiselijke logeerplek voor kinderen en jongeren van 4 tot 18 jaar met extra ondersteuningsbehoeften. We verblijven op vakantiepark RCN Het Grote Bos in Doorn.",
      "We werken bewust kleinschalig: per bungalow logeren maximaal vijf kinderen, verdeeld over vier bungalows. Zo kunnen we goed matchen op prikkelgevoeligheid en ontwikkelingsniveau.",
    ],
    points: [
      "Logeerweekend: vrijdag vanaf 17:00 uur tot zondag uiterlijk 17:00 uur.",
      "Maximaal 5 kinderen per bungalow: minder prikkels, meer rust en aandacht.",
      "Ruimte voor 1-op-1 momenten, hulp bij overgangsmomenten en emotieregulatie.",
      "Activiteiten die passen bij het kind: prikkelarm of juist sensomotorisch.",
    ],
  },
  {
    id: "vakantieopvang",
    to: ROUTES.vakantieopvang,
    title: "Vakantieopvang",
    summary:
      "Vakantieweken met een rustig ritme en aandacht voor jouw kind — ruimte voor plezier én voor herstelmomenten.",
    icon: Sun,
    verified: true,
    intro: [
      "Naast logeerweekenden organiseren we vakantieweken voor kinderen met een verstandelijke beperking. In een vakantieweek bouwen we het ritme rustig op.",
      "Er is ruimte voor plezier, maar ook voor herstelmomenten. We stemmen het programma af op de groep, niet andersom.",
    ],
    points: [
      "Een veilige groep waarin kinderen zichzelf kunnen zijn.",
      "Rust, structuur en voorspelbaarheid door de week heen.",
      "Programma afgestemd op wat voor het kind haalbaar is.",
    ],
  },
  {
    id: "crisisopvang",
    to: ROUTES.crisisopvang,
    title: "Crisisopvang",
    summary:
      "Tijdelijke opvang (maximaal vier weken) wanneer er even rust en veiligheid nodig is omdat het thuis of op school vastloopt.",
    icon: LifeBuoy,
    verified: true,
    intro: [
      "Soms is er acuut rust en veiligheid nodig omdat het thuis of op school vastloopt. Dan kan crisisopvang bij Sem & Co tijdelijk uitkomst bieden: kleinschalig, huiselijk en met duidelijke structuur.",
      "Crisisopvang is tijdelijk en duurt maximaal vier weken. Neem contact op om de mogelijkheden te bespreken.",
    ],
    points: [
      "Voor kinderen en jongeren die baat hebben bij rust, voorspelbaarheid en nabijheid.",
      "Tijdelijk: maximaal vier weken.",
      "Aanmelding en verwijzing via de gemeente (Jeugdwet) of het zorgkantoor (WLZ).",
    ],
  },
];

/** Lookup a service by its id/slug. */
export function getServiceById(id: string): Service | undefined {
  return careServices.find((s) => s.id === id);
}

/**
 * Crisis aanmelding/verwijzing routes — verified from the /crisisopvang page.
 * Uses only funding terminology that appears on the live site (Jeugdwet, WLZ).
 */
export interface FundingRoute {
  id: string;
  name: string;
  scheme: string;
  steps: string[];
}

export const crisisFundingRoutes: FundingRoute[] = [
  {
    id: "gemeente",
    name: "Via de gemeente",
    scheme: "Jeugdwet",
    steps: [
      "Ouders of verwijzer neemt contact op.",
      "We checken snel of het past.",
      "De gemeente regelt (of wijzigt) de beschikking.",
      "Start met duidelijke afspraken en evaluatie.",
    ],
  },
  {
    id: "zorgkantoor",
    name: "Via het zorgkantoor",
    scheme: "WLZ",
    steps: [
      "Bij een WLZ-indicatie neem je contact met ons op.",
      "We stemmen af wat mogelijk is binnen de indicatie.",
      "De inzet wordt geregeld via de WLZ-route.",
      "Start met doelen en evaluatie.",
    ],
  },
];
