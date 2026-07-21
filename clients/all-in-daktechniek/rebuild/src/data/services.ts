/**
 * Services — content rewritten from the live site's own copy (all-indaktechniek.nl).
 * Facts are preserved exactly; only spelling/tone were tidied. Per-service
 * guarantees are kept as stated on the current site (they differ per service —
 * this is intentional, not to be unified here). See docs/CONTENT-INVENTORY.md.
 */
import {
  Layers,
  Home,
  Droplets,
  Wind,
  ThermometerSun,
  ShieldCheck,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  slug: string;
  title: string;
  icon: LucideIcon;
  image: string;
  /** Short teaser (from the site) used in cards and the services grid. */
  summary: string;
  /** Longer intro paragraphs on the detail page. */
  intro: string[];
  /** Bullet list of concrete works, where the site provides them. */
  works?: string[];
  /** Guarantee text exactly as stated on the current site for this service. */
  guarantee?: string;
  seoTitle: string;
  seoDescription: string;
}

export const services: Service[] = [
  {
    slug: "platte-daken",
    title: "Platte daken",
    icon: Layers,
    image: "/images/all-in-daktechniek/slider-platte-daken.webp",
    summary:
      "Specialist in bitumen dakrenovaties: overlagen, reparatie en volledige vervanging van uw platte dak.",
    intro: [
      "Wij zijn specialist op het gebied van bitumen dakrenovaties. De meeste platte daken in Nederland zijn bedekt met bitumen dakbedekking, omdat de levensduur hoog is: het is slijtvast en eenvoudig te repareren of te renoveren. Een versleten dak kunnen we vernieuwen door een nieuwe toplaag aan te brengen (overlagen), die geheel wordt verkleefd door middel van branden.",
      "De uitstekende hechting en waterdichtheid maken bitumen populair in ons Nederlandse klimaat. Naast bitumineuze daken zien wij ook nog vaak mastieken daken. Bij lekkage aan een mastiek dak vervangen wij het platte dak tot op het dakbeschot.",
      "Lekkage aan een plat dak ontstaat vaak door vervuilde afvoeren. Goed onderhoud van dakranden, hemelwaterafvoeren, doorvoeren en vloeinaden voorkomt slijtage. Wij ontzorgen u graag en houden uw dak waterdicht.",
    ],
    seoTitle: "Platte daken & bitumen dakbedekking | All-in Daktechniek",
    seoDescription:
      "Bitumen plat dak vervangen, overlagen of repareren in Honselersdijk en omgeving. Specialist in platte daken en dakrenovatie. Vraag een vrijblijvende offerte aan.",
  },
  {
    slug: "pannendaken",
    title: "Pannendaken",
    icon: Home,
    image: "/images/all-in-daktechniek/slider-pannendaken.webp",
    summary:
      "Van stormschade tot een compleet nieuw daksysteem — alle typen dakpannen op ieder dak.",
    intro: [
      "Op het gebied van pannendaken kan ons dakdekkersbedrijf iedere denkbare klus op zich nemen: van het herstellen van stormschade tot het vervangen van het dakbeschot of het plaatsen en renoveren van een dakkapel. Desgewenst realiseren wij een totaalpakket.",
      "Wij leveren en plaatsen alle typen dakpannen — beton- of keramische pannen, platte of geglazuurde pannen en zelfs gebruikte pannen. Niet elk type pan is geschikt op ieder dak; dit hangt onder andere af van de hellingsgraad. Laat u vrijblijvend informeren over de mogelijkheden.",
    ],
    works: [
      "Complete nieuwe daksystemen",
      "Leveren en monteren van Velux dakvensters",
      "Leveren en monteren van dakisolatie",
      "Traditioneel vorstwerk (specie/flexim)",
      "Renoveren van schoorstenen",
      "Realiseren of renoveren van dakkapellen",
      "Herstel van stormschade",
      "Opsporen en verhelpen van lekkages en/of houtrot",
      "Aanbrengen of vervangen van zinken dakgoten en hemelwaterafvoeren",
      "Aanbrengen of vervangen van lood- en zinkaansluitingen",
      "Vervangen van houten dakbeschot",
    ],
    guarantee: "15 jaar garantie op een compleet nieuw daksysteem",
    seoTitle: "Pannendaken, dakkapellen & stormschade | All-in Daktechniek",
    seoDescription:
      "Dakpannen vervangen, dakkapel plaatsen, stormschade herstellen of een compleet nieuw daksysteem. Alle typen dakpannen. All-in Daktechniek, Honselersdijk e.o.",
  },
  {
    slug: "lood-en-zinkwerk",
    title: "Lood en zinkwerk",
    icon: Droplets,
    image: "/images/all-in-daktechniek/slider-lood-zinkwerk.webp",
    summary:
      "Dakgoten, hemelwaterafvoeren en dakkapelbekleding in zink — op maat gemaakt en gemonteerd.",
    intro: [
      "All-in Daktechniek is gespecialiseerd in diverse zinkwerkzaamheden. U kunt bij ons terecht voor het repareren of vervangen van alle typen dakgoten, van getimmerde bakgoten tot dakgoten met beugelsysteem. Is uw goot aan vervanging toe? Wij meten hem in en maken de nieuwe zinken gootstukken precies op maat.",
      "Ook zinken bekleding voor uw dakkapel valt onder onze werkzaamheden, op diverse manieren uit te voeren — van een zinken plat dak met zinken wangen tot fraaie zinken felsbanen.",
      "Daarnaast monteren wij complete zinken hemelwaterafvoeren (hwa) naar wens, van sierlijke vergaarbakken tot handgemaakte montagebeugels. Indien gewenst sluiten wij uw hwa aan op de riolering. Door uw dakgoot jaarlijks te reinigen kan nieuw zinkwerk wel 30 jaar meegaan.",
    ],
    guarantee: "10 jaar garantie op zinkwerk",
    seoTitle: "Lood en zinkwerk, dakgoten & hemelwaterafvoer | All-in Daktechniek",
    seoDescription:
      "Zinken dakgoten repareren of vervangen, dakkapelbekleding en hemelwaterafvoeren op maat in Honselersdijk e.o. Lood- en zinkwerk door All-in Daktechniek.",
  },
  {
    slug: "schoorstenen",
    title: "Schoorstenen",
    icon: Wind,
    image: "/images/all-in-daktechniek/slider-schoorstenen.webp",
    summary:
      "Schoorsteenlekkage snel en efficiënt verholpen — loodaansluitingen, voegwerk en metselwerk.",
    intro: [
      "Een schoorsteenlekkage is een van de meest voorkomende daklekkages: vrijwel 55% van alle lekkages die onze specialisten verhelpen ontstaat bij de schoorsteen. Dat komt doordat de schoorsteen een opening in uw dak is die veel wind en regen te verduren krijgt en altijd een schaduwzijde kent.",
      "Een schoorsteen bestaat uit metselwerk, loodaansluitingen, rookkanalen en een bovenplaat of element van cement of natuursteen. Omdat de schoorsteen vrij en los van het dak staat, is onderhoud belangrijk. Weersinvloeden en nestelend ongedierte tasten hem continu aan.",
      "Slechte, gescheurde of opgewaaide loodslabben, versleten en verzand voegwerk, krimpscheuren of gebarsten bakstenen — het zijn alledaagse problemen. Vaak raakt de rollaag (de bovenste rij bakstenen) als eerste los. Wij herstellen het vakkundig.",
    ],
    seoTitle: "Schoorsteen renovatie & lekkage verhelpen | All-in Daktechniek",
    seoDescription:
      "Schoorsteenlekkage, loodaansluitingen en voegwerk vakkundig hersteld in Honselersdijk e.o. Schoorsteenrenovatie door All-in Daktechniek. Vraag een offerte aan.",
  },
  {
    slug: "dakisolatie",
    title: "Dakisolatie",
    icon: ThermometerSun,
    image: "/images/all-in-daktechniek/slider-dakisolatie.webp",
    summary:
      "Isoleer uw dak vanaf de buitenzijde: een beter woonklimaat en een fors lagere energierekening.",
    intro: [
      "Het isoleren van uw dak kent vele voordelen. Het bekendste is een sterk verbeterd woonklimaat: in de zomer blijft het binnen koel, in de winter houdt de isolatie de kou buiten en uw gestookte warmte binnen. De besparing kan oplopen tot wel 30%, wat honderden euro's per jaar kan schelen — en u draagt bij aan minder CO₂-uitstoot.",
      "Een bijkomend voordeel is dat de waarde van uw woning stijgt: een goed geïsoleerde woning krijgt een hogere energiescore en dus een hogere verkoopwaarde.",
      "Wij isoleren schuine daken vanaf de buitenzijde. Zo blijft uw woning aan de binnenzijde onaangetast en heeft u geen ruimteverlies. Omdat de isolatie niet onderbroken wordt, ontstaan er geen koudebruggen en is uw dakconstructie goed beschermd tegen vocht en weersinvloeden.",
    ],
    seoTitle: "Dakisolatie vanaf de buitenzijde | All-in Daktechniek",
    seoDescription:
      "Dak isoleren vanaf de buitenzijde voor een beter woonklimaat en tot 30% energiebesparing. Dakisolatie door All-in Daktechniek in Honselersdijk e.o.",
  },
  {
    slug: "epdm",
    title: "EPDM",
    icon: ShieldCheck,
    image: "/images/all-in-daktechniek/slider-platte-daken.webp",
    summary:
      "Duurzame EPDM-dakbedekking met een levensverwachting van circa 40 jaar, geschikt voor elke dakvorm.",
    intro: [
      "EPDM is een duurzame dakbedekking met een lange levensduur (circa 40 jaar). Let op: op de markt vindt u veel typen en merken EPDM-producten met verschillende kwaliteit. Laat u goed informeren — neem gerust contact met ons op voor advies.",
      "EPDM is milieuvriendelijk, bijzonder duurzaam en geschikt voor iedere dakvorm.",
    ],
    works: [
      "Levensverwachting circa 40 jaar",
      "Voor nieuwbouw en renovatie",
      "Geschikt voor elke dakvorm",
      "Blijvend elastisch",
      "100% recyclebaar",
      "Onderhoudsvrij en altijd beloopbaar",
      "Hoge chemische bestendigheid",
      "100% UV- en ozonbestendig",
    ],
    seoTitle: "EPDM dakbedekking | All-in Daktechniek",
    seoDescription:
      "Duurzame EPDM-dakbedekking met een levensduur van circa 40 jaar, geschikt voor elke dakvorm. EPDM leggen door All-in Daktechniek in Honselersdijk e.o.",
  },
  {
    slug: "inspectie-en-onderhoud",
    title: "Inspectie en dak onderhoud",
    icon: SearchCheck,
    image: "/images/all-in-daktechniek/slider-dakisolatie.webp",
    summary:
      "Een kosteloze dakinspectie verlengt de levensduur van uw dak en voorkomt lekkages.",
    intro: [
      "Uw dak beschermt u tegen alle weersomstandigheden, dus goed onderhoud is belangrijk. Door onderhoud verlengt u de levensduur en houdt u langer een betrouwbaar dak boven uw hoofd. U kunt bij ons terecht voor zowel onderhoud als inspectie.",
      "Tijdens de inspectie beoordelen wij de staat van het dak en welke punten reparatie of renovatie nodig hebben. Dat geeft inzicht in gebreken en voorkomt toekomstige lekkages en schade. Onze kosteloze inspectie kan u dus zowel ongemak als geld besparen. Desgewenst stellen wij daarna een offerte op.",
      "Wij bespreken ook graag de mogelijkheden voor een periodieke inspectie- en onderhoudsbeurt. Neem vrijblijvend contact op en informeer naar de voorwaarden.",
    ],
    seoTitle: "Dakinspectie & dakonderhoud | All-in Daktechniek",
    seoDescription:
      "Kosteloze dakinspectie en periodiek dakonderhoud in Honselersdijk e.o. Voorkom lekkages en verleng de levensduur van uw dak met All-in Daktechniek.",
  },
];

export const getService = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);
