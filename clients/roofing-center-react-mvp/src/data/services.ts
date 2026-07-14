import {
  Flame,
  Layers,
  Wrench,
  Droplets,
  ClipboardCheck,
  ShieldCheck,
  Umbrella,
  type LucideIcon,
} from "lucide-react";

export interface ServiceImage {
  base: string; // path under /images/roofing-center/ (without extension)
  w: number;
  h: number;
  alt: string;
}

export interface Service {
  slug: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  intro: string[];
  includes: string[];
  image: ServiceImage;
}

/**
 * Confirmed flat-roof services (all supported by the supplied photos).
 * Copy is neutral and factual — no prices, guarantees, response times or awards.
 */
export const services: Service[] = [
  {
    slug: "bitumen-dakbedekking",
    title: "Bitumen dakbedekking",
    icon: Flame,
    summary: "Gebrande bitumen dakbedekking voor een sterk, waterdicht plat dak.",
    intro: [
      "Bitumen is een beproefd en robuust systeem voor platte daken. De banen worden vakkundig gebrand en naadloos op elkaar aangesloten, zodat er een waterdichte laag ontstaat.",
      "Wij werken zowel met bitumen als met EPDM. Welk systeem het beste past, bespreken we op basis van uw dak en situatie.",
    ],
    includes: [
      "Meerlaags gebrand bitumen",
      "Nette aansluitingen bij opstanden en randen",
      "Waterdichte afwerking rond doorvoeren",
      "Ook EPDM mogelijk als alternatief",
    ],
    image: { base: "services/afgewerkt-bitumen-dak", w: 1400, h: 1050, alt: "Afgewerkt plat dak met gebrande bitumen dakbedekking" },
  },
  {
    slug: "dakrenovatie",
    title: "Renovatie van platte daken",
    icon: Layers,
    summary: "Volledige vernieuwing van een verouderd of versleten plat dak.",
    intro: [
      "Is uw dakbedekking aan vervanging toe? Bij een renovatie vernieuwen we de dakbedekking en bouwen we het dak weer laag voor laag op tot een strak, waterdicht geheel.",
      "We stemmen de aanpak af op de staat van het dak en op wat er praktisch haalbaar is.",
    ],
    includes: [
      "Verwijderen van oude dakbedekking",
      "Opbouw van een nieuwe, waterdichte laag",
      "Aandacht voor randen, opstanden en doorvoeren",
      "Nette oplevering",
    ],
    image: { base: "services/nieuwe-dakbedekking", w: 1400, h: 1050, alt: "Nieuw aangebrachte dakbedekking op een plat dak" },
  },
  {
    slug: "dakreparatie",
    title: "Reparatie van platte daken",
    icon: Wrench,
    summary: "Gericht herstel van schade, scheuren en zwakke plekken.",
    intro: [
      "Niet elk probleem vraagt om een volledig nieuw dak. Bij een reparatie pakken we gericht de zwakke plekken aan, zoals scheuren, blaasvorming of beschadigde naden.",
      "Na een inspectie adviseren we of een reparatie volstaat of dat renovatie verstandiger is.",
    ],
    includes: [
      "Herstel van scheuren en naden",
      "Aanpakken van blaas- en plasvorming",
      "Herstel rond doorvoeren en randen",
      "Advies over reparatie versus renovatie",
    ],
    image: { base: "services/dakschade-inspectie", w: 1200, h: 1600, alt: "Beoordeling van schade aan een bestaande platte dakbedekking" },
  },
  {
    slug: "daklekkage",
    title: "Daklekkage herstellen",
    icon: Droplets,
    summary: "Lekkages opsporen en verhelpen bij platte daken.",
    intro: [
      "Een lekkage geeft vaak overlast en kan schade veroorzaken. We zoeken de oorzaak op en herstellen de lekkage vakkundig.",
      "Bij een actieve lekkage adviseren we om direct contact op te nemen, zodat we de mogelijkheden kunnen bespreken.",
    ],
    includes: [
      "Onderzoek naar de oorzaak van de lekkage",
      "Herstel van de waterdichte laag",
      "Aandacht voor kwetsbare details",
      "Advies om herhaling te voorkomen",
    ],
    image: { base: "services/dakinspectie-bestaand", w: 1400, h: 1050, alt: "Bestaand plat dak met sporen van veroudering, beoordeeld op lekkage" },
  },
  {
    slug: "dakinspectie",
    title: "Dakinspectie",
    icon: ClipboardCheck,
    summary: "Een heldere beoordeling van de staat van uw platte dak.",
    intro: [
      "Met een inspectie brengen we de staat van uw dak in kaart. Zo weet u waar u aan toe bent en kunt u onderbouwd een keuze maken.",
      "Een definitief advies is pas mogelijk na een inspectie op locatie.",
    ],
    includes: [
      "Visuele beoordeling van de dakbedekking",
      "Aandacht voor naden, randen en doorvoeren",
      "Signaleren van risico's op lekkage",
      "Praktisch advies over vervolgstappen",
    ],
    image: { base: "services/dakinspectie-bestaand", w: 1400, h: 1050, alt: "Inspectie van een bestaand plat dak" },
  },
  {
    slug: "dakonderhoud",
    title: "Preventief dakonderhoud",
    icon: ShieldCheck,
    summary: "Onderhoud om problemen voor te zijn en de levensduur te verlengen.",
    intro: [
      "Met periodiek onderhoud houdt u uw platte dak in goede staat en voorkomt u dat kleine gebreken uitgroeien tot grote problemen.",
      "We kijken naar de details die er op een plat dak toe doen, zoals afvoeren, naden en opstanden.",
    ],
    includes: [
      "Controle van de dakbedekking",
      "Vrijmaken en controleren van afvoeren",
      "Nalopen van naden en aansluitingen",
      "Advies over tijdig ingrijpen",
    ],
    image: { base: "services/afgewerkt-bitumen-dak", w: 1400, h: 1050, alt: "Goed onderhouden plat dak met verzorgde afwerking" },
  },
  {
    slug: "waterdicht-maken",
    title: "Waterdicht maken",
    icon: Umbrella,
    summary: "Een strak, waterdicht plat dak — tot in de details.",
    intro: [
      "Een plat dak is zo goed als zijn zwakste detail. Wij zorgen voor een waterdichte afwerking, ook rond doorvoeren, opstanden en randen.",
      "Zo krijgt u een dak waar u jarenlang op kunt vertrouwen.",
    ],
    includes: [
      "Waterdichte dakbedekking",
      "Zorgvuldige detaillering",
      "Aansluitingen bij muren en opstanden",
      "Afwerking rond doorvoeren",
    ],
    image: { base: "services/vakmanschap-afwerking", w: 1400, h: 1050, alt: "Vakkundige, waterdichte afwerking van een plat dak bij een opstand" },
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
