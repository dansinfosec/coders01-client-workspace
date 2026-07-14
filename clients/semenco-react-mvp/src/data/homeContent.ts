import { HeartHandshake, Home, ShieldCheck, Users } from "lucide-react";
import type { HomeContent } from "@/types/content";
import { ROUTES } from "@/routes/paths";

/**
 * Home page content — verified and lightly rewritten from the live site for
 * clarity/tone (factual meaning unchanged). See content-inventory.md.
 */
export const homeContent: HomeContent = {
  hero: {
    eyebrow: "Logeeropvang op RCN Het Grote Bos, Doorn",
    title: "Kleinschalig logeren met échte aandacht",
    subtitle:
      "Een warme, huiselijke logeerplek voor kinderen en jongeren van 4 tot 18 jaar met extra ondersteuningsbehoeften. Maximaal vijf kinderen per bungalow — rust, structuur en persoonlijke aandacht.",
    primaryCtaLabel: "Aanmelden",
    primaryCtaTo: ROUTES.aanmelden,
    secondaryCtaLabel: "Ontdek onze werkwijze",
    secondaryCtaTo: ROUTES.werkwijze,
  },
  intro: {
    heading: "Bewust kleinschalig",
    paragraphs: [
      "Bij Sem & Co werken we bewust kleinschalig. Per bungalow logeren maximaal vijf kinderen, verdeeld over vier bungalows. Zo kunnen we goed matchen op prikkelgevoeligheid en ontwikkelingsniveau.",
      "Aanmelden is een eerste stap en volledig vrijblijvend. Daarna kijken we samen, rustig en zorgvuldig, wat passend is — altijd op het tempo van het kind.",
    ],
  },
  highlights: [
    {
      id: "kleinschalig",
      title: "Kleinschalig",
      description: "Maximaal vijf kinderen per bungalow, verdeeld over vier bungalows.",
      icon: Users,
    },
    {
      id: "aandacht",
      title: "Persoonlijke aandacht",
      description: "Minder prikkels en meer echte aandacht, afgestemd op ieder kind.",
      icon: HeartHandshake,
    },
    {
      id: "rust",
      title: "Rust en structuur",
      description: "Voorspelbaarheid en duidelijke overgangsmomenten geven houvast.",
      icon: ShieldCheck,
    },
    {
      id: "huiselijk",
      title: "Huiselijke omgeving",
      description: "Een warme logeerplek in het bos op vakantiepark RCN Het Grote Bos.",
      icon: Home,
    },
  ],
  forWhom: {
    heading: "Voor kinderen met een beperking",
    paragraphs: [
      "Sem & Co is er voor kinderen en jongeren van 4 tot 18 jaar met extra ondersteuningsbehoeften. We kijken naar het kind: naar het prikkelprofiel, de ontwikkelingsleeftijd en wat een kind aankan.",
      "Sommige kinderen hebben extra nabijheid nodig: meer 1-op-1 momenten, extra ondersteuning bij overgangsmomenten of hulp bij emotieregulatie. Daar is bij ons ruimte voor.",
    ],
  },
  location: {
    heading: "Rust van het bos, ruimte om te ontdekken",
    paragraphs: [
      "We verblijven op vakantiepark RCN Het Grote Bos in Doorn. Op het park zijn veel faciliteiten, zoals een openluchtzwembad met glijbaan, speeltuinen en een bowlingbaan.",
      "We kiezen nooit zomaar iets leuks: we kiezen activiteiten die passen bij het kind, bij de belastbaarheid en bij het moment. Soms is dat zwemmen of spelen, en soms juist wandelen in het bos.",
    ],
  },
  closingCta: {
    title: "Benieuwd of Sem & Co past bij jouw kind?",
    description:
      "Aanmelden is vrijblijvend. We nemen de tijd om jullie goed te leren kennen, zodat het echt past.",
    primaryLabel: "Aanmelden",
    primaryTo: ROUTES.aanmelden,
    secondaryLabel: "Neem contact op",
    secondaryTo: ROUTES.contact,
  },
};
