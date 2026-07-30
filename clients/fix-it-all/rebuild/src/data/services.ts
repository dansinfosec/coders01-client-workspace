import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Wrench,
  Gauge,
  Cog,
  Flame,
  Snowflake,
  CircleDot,
  ScanLine,
  Hammer,
} from "lucide-react";

/**
 * Centrale dienstendata — single source of truth voor het dienstenoverzicht, de dienstpagina's
 * en de navigatie. Alle inhoudelijke tekst is afgeleid van de live Fix-it All-site (audit 2026-07-30).
 *
 * REGELS:
 *  - Geen verzonnen prijzen, garanties of keurmerken. De ENIGE bevestigde actie is
 *    "gratis APK bij een grote onderhoudsbeurt".
 *  - Diensten zonder eigen bronpagina (reparatie, diagnose) krijgen uitsluitend algemeen-ware
 *    tekst + een zichtbare TODO; geen specifieke procedures/prijzen.
 */

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  /** Volledige, commerciële titel (H1). */
  title: string;
  /** Korte naam voor nav/kaarten. */
  shortLabel: string;
  icon: LucideIcon;
  /** Eén zin voor kaarten/teasers. */
  summary: string;
  /** Inleidende alinea(s) op de dienstpagina. */
  intro: string;
  /** Concreet: wat de dienst inhoudt / wat er gebeurt. */
  includes: string[];
  /** Voordelen (klantwaarde). */
  benefits: string[];
  /** Werkwijze (stappen). */
  process: { title: string; detail: string }[];
  faq: ServiceFAQ[];
  /** Interne links naar verwante diensten (slugs). */
  related: string[];
  /** Toon de bevestigde gratis-APK-actie op deze pagina. */
  showApkOffer?: boolean;
  seo: { title: string; description: string };
}

export const services: Service[] = [
  {
    slug: "apk-keuring",
    title: "APK-keuring in Utrecht",
    shortLabel: "APK-keuring",
    icon: ShieldCheck,
    summary: "RDW-erkende keuring op veiligheid, milieu en registratie — vakkundig en eerlijk.",
    intro:
      "Onze RDW-erkende keurmeesters hebben jarenlange ervaring. Bij de APK beoordelen wij uw auto op verkeersveiligheid, milieu en registratie. Hoe vaak uw auto gekeurd moet worden, hangt af van de leeftijd en de brandstof. U ontvangt altijd een duidelijk keuringsrapport met de uitslag en, waar nodig, een eerlijk reparatieadvies.",
    includes: [
      "Volledige APK volgens de wettelijke eisen van de RDW",
      "Controle op veiligheid, milieu en registratie",
      "Duidelijk keuringsrapport met uitslag (goed- of afkeur)",
      "Eerlijk advies over eventuele reparatiepunten",
    ],
    benefits: [
      "RDW-erkende keurmeesters met jarenlange ervaring",
      "Gratis APK bij een grote onderhoudsbeurt",
      "Persoonlijke uitleg van het keuringsrapport",
    ],
    process: [
      { title: "Afspraak", detail: "Plan uw APK online of bel ons. Rijd voor en wij nemen uw auto in." },
      { title: "Keuring", detail: "De keurmeester controleert uw auto op alle wettelijke punten." },
      { title: "Uitslag & advies", detail: "U ontvangt het keuringsrapport en, indien nodig, een eerlijk reparatieadvies." },
    ],
    faq: [
      {
        q: "Wanneer moet mijn auto gekeurd worden?",
        a: "Dat hangt af van de leeftijd en de brandstof van uw auto. U kunt uw APK-vervaldatum controleren via het RDW-portaal (ovi.rdw.nl). Een verlopen APK kan een boete opleveren, dus plan op tijd.",
      },
      {
        q: "Wat kost een APK?",
        a: "De prijs bespreken we graag met u — bij een grote onderhoudsbeurt is de APK gratis. Neem contact op of maak een afspraak voor de actuele voorwaarden.",
      },
      {
        q: "Kan ik wachten tijdens de keuring?",
        a: "Vaak wel. Geef bij het maken van de afspraak aan dat u wilt wachten, dan houden we daar rekening mee.",
      },
    ],
    related: ["grote-beurt", "onderhoud", "reparatie"],
    showApkOffer: true,
    seo: {
      title: "APK-keuring Utrecht — RDW-erkend | Fix-it All",
      description:
        "RDW-erkende APK-keuring in Utrecht. Ervaren keurmeesters, duidelijk rapport en eerlijk advies. Gratis APK bij een grote onderhoudsbeurt. Maak een afspraak.",
    },
  },
  {
    slug: "onderhoud",
    title: "Auto-onderhoud in Utrecht",
    shortLabel: "Onderhoud",
    icon: Wrench,
    summary: "Kleine of grote beurt voor alle merken — zodat u veilig en zorgeloos blijft rijden.",
    intro:
      "Iedere auto heeft regelmatig onderhoud nodig om veilig en vertrouwd de weg op te kunnen. Of een kleine of grote beurt nodig is, hangt af van de onderhoudshistorie, het type auto, de leeftijd, de kilometerstand en het aantal kilometers dat u per jaar rijdt. Onze gediplomeerde monteurs onderhouden alle merken.",
    includes: [
      "Onderhoud voor alle automerken",
      "Kleine onderhoudsbeurt: olie en oliefilter verversen + 20 controlepunten",
      "Grote onderhoudsbeurt: bougies, filters en een inspectie van meer dan 80 punten",
      "Diverse vloeistoffen verversen of bijvullen",
    ],
    benefits: [
      "Gediplomeerde monteurs",
      "Altijd snel terecht",
      "Gratis APK bij een grote onderhoudsbeurt",
    ],
    process: [
      { title: "Afspraak", detail: "Kies online een moment dat u past, of bel ons voor advies." },
      { title: "Onderhoud", detail: "Wij voeren de kleine of grote beurt uit en controleren de vitale punten." },
      { title: "Terugkoppeling", detail: "We bespreken wat we hebben gedaan en of er nog aandachtspunten zijn." },
    ],
    faq: [
      {
        q: "Heb ik een kleine of grote beurt nodig?",
        a: "Dat bepalen we samen op basis van de onderhoudshistorie, leeftijd, kilometerstand en het type auto. Twijfelt u? Bel ons of maak een afspraak, dan adviseren we u eerlijk.",
      },
      {
        q: "Onderhouden jullie ook mijn merk?",
        a: "Ja. Fix-it All onderhoudt en repareert alle merken.",
      },
    ],
    related: ["kleine-beurt", "grote-beurt", "apk-keuring"],
    showApkOffer: true,
    seo: {
      title: "Auto-onderhoud Utrecht — kleine & grote beurt | Fix-it All",
      description:
        "Auto-onderhoud in Utrecht voor alle merken. Kleine en grote onderhoudsbeurt door gediplomeerde monteurs. Gratis APK bij een grote beurt. Maak een afspraak.",
    },
  },
  {
    slug: "kleine-beurt",
    title: "Kleine onderhoudsbeurt",
    shortLabel: "Kleine beurt",
    icon: Gauge,
    summary: "Olie en oliefilter verversen plus een controle van ruim 20 vitale onderdelen.",
    intro:
      "Tijdens een kleine onderhoudsbeurt wordt de olie van uw auto gecontroleerd en ververst. Daarnaast controleren wij meer dan 20 vitale onderdelen van uw auto op slijtage, zodat u veilig verder kunt.",
    includes: [
      "Motorolie en oliefilter vervangen",
      "Diverse vloeistoffen bijvullen",
      "Controle van uitlaat, remmen, verlichting, banden en ruitenwissers",
      "Inspectie van meer dan 20 vitale onderdelen op slijtage",
    ],
    benefits: ["Gediplomeerde monteurs", "Altijd snel terecht", "Duidelijk advies zonder verrassingen"],
    process: [
      { title: "Afspraak", detail: "Maak online een afspraak of bel ons." },
      { title: "Uitvoering", detail: "Wij verversen de olie en het oliefilter en lopen de controlepunten na." },
      { title: "Advies", detail: "U hoort of alles in orde is of dat er aandachtspunten zijn." },
    ],
    faq: [
      {
        q: "Hoe lang duurt een kleine beurt?",
        a: "Meestal kunt u dezelfde dag terecht. Geef bij het maken van de afspraak aan of u wilt wachten, dan stemmen we het tijdstip daarop af.",
      },
      {
        q: "Wat kost een kleine beurt?",
        a: "De prijs hangt af van uw auto en het benodigde werk. Neem contact op of maak een afspraak voor een opgave.",
      },
    ],
    related: ["grote-beurt", "onderhoud", "apk-keuring"],
    seo: {
      title: "Kleine onderhoudsbeurt Utrecht | Fix-it All",
      description:
        "Kleine onderhoudsbeurt in Utrecht: olie en oliefilter verversen plus controle van 20+ vitale onderdelen. Gediplomeerde monteurs. Maak een afspraak.",
    },
  },
  {
    slug: "grote-beurt",
    title: "Grote onderhoudsbeurt",
    shortLabel: "Grote beurt",
    icon: Cog,
    summary: "Uitgebreide beurt met bougies, filters en een inspectie van meer dan 80 punten.",
    intro:
      "Tijdens een grote onderhoudsbeurt wordt uw auto op alle vitale punten gecontroleerd. We vervangen de bougies, de motorolie en alle filters, en verversen of vullen diverse vloeistoffen aan. Wij adviseren om de APK te combineren met de grote beurt.",
    includes: [
      "Nieuwe bougies, motorolie en alle filters",
      "Diverse vloeistoffen verversen of bijvullen",
      "Inspectie van meer dan 80 cruciale punten (uitlaat, remmen, verlichting, schokdempers, accu, banden, ruitenwissers)",
    ],
    benefits: [
      "Gratis APK bij een grote onderhoudsbeurt",
      "Gediplomeerde monteurs",
      "Grondige controle van meer dan 80 punten",
    ],
    process: [
      { title: "Afspraak", detail: "Plan de grote beurt online in, eventueel samen met de APK." },
      { title: "Grote beurt + APK", detail: "Wij voeren de beurt uit en keuren uw auto in één keer (APK gratis)." },
      { title: "Terugkoppeling", detail: "U krijgt een duidelijk overzicht van het uitgevoerde werk en het keuringsrapport." },
    ],
    faq: [
      {
        q: "Krijg ik echt gratis APK bij een grote beurt?",
        a: "Ja, dat is onze bevestigde actie: bij een grote onderhoudsbeurt is de APK gratis. Handig om beide in één afspraak te combineren.",
      },
      {
        q: "Wat kost een grote beurt?",
        a: "De prijs hangt af van uw auto en de benodigde onderdelen. Neem contact op of maak een afspraak voor een opgave.",
      },
    ],
    related: ["apk-keuring", "kleine-beurt", "onderhoud"],
    showApkOffer: true,
    seo: {
      title: "Grote onderhoudsbeurt Utrecht — gratis APK | Fix-it All",
      description:
        "Grote onderhoudsbeurt in Utrecht: bougies, filters, olie en 80+ controlepunten. Gratis APK bij een grote beurt. Gediplomeerde monteurs. Maak een afspraak.",
    },
  },
  {
    slug: "uitlaat-laswerk",
    title: "Uitlaat & laswerk in Utrecht",
    shortLabel: "Uitlaat & laswerk",
    icon: Flame,
    summary: "Lekkende of beschadigde uitlaat vakkundig lassen in onze eigen werkplaats.",
    intro:
      "Een lekkende uitlaat door een klap of door roest? In onze eigen werkplaats lassen wij uw uitlaat vakkundig, zodat deze weer goed vastzit en afgedicht is. Zo bent u snel weer van het lawaai af en kunt u weer normaal rijden. Tijdens de reparatie kunt u gebruikmaken van een leenfiets.",
    includes: [
      "Uitlaat lassen bij lekkage, roest- of stootschade",
      "Vakkundig laswerk met professionele materialen",
      "Diagnose met moderne apparatuur",
      "Leenfiets beschikbaar tijdens de reparatie",
    ],
    benefits: ["Snel van het lawaai af", "Leenfiets tijdens de reparatie", "Betaalbaar en zonder gedoe"],
    process: [
      { title: "Breng uw auto", detail: "Kom langs of maak een afspraak; wij bekijken de uitlaat." },
      { title: "Leenfiets mee", detail: "Tijdens de reparatie kunt u een leenfiets gebruiken." },
      { title: "Wij bellen u", detail: "Zodra het laswerk klaar is, nemen we contact met u op om de auto op te halen." },
    ],
    faq: [
      {
        q: "Kan elke uitlaat gelast worden?",
        a: "Vaak wel bij lekkage door roest of een klap. We beoordelen uw uitlaat en adviseren eerlijk of lassen de juiste oplossing is of dat vervanging beter is.",
      },
      {
        q: "Heb ik vervangend vervoer?",
        a: "Tijdens het laswerk kunt u gebruikmaken van een leenfiets.",
      },
    ],
    related: ["reparatie", "onderhoud", "apk-keuring"],
    seo: {
      title: "Uitlaat lassen Utrecht — laswerk aan uw uitlaat | Fix-it All",
      description:
        "Uitlaat lassen in Utrecht bij lekkage, roest of stootschade. Vakkundig laswerk in eigen werkplaats, leenfiets beschikbaar. Neem contact op.",
    },
  },
  {
    slug: "airco-service",
    title: "Aircoservice",
    shortLabel: "Aircoservice",
    icon: Snowflake,
    summary: "Airco reinigen, controleren en bijvullen — voor koele lucht zonder nare geurtjes.",
    intro:
      "Een airco heeft onderhoud nodig. Zonder onderhoud kunnen bacteriën, schimmels en micro-organismen in het interieur terechtkomen, wat vervelende reacties als niezen en hoesten kan veroorzaken. Ook kan de airco muf gaan ruiken en beslaan de ruiten sneller. Wij adviseren de airco elke 12 maanden te laten controleren.",
    includes: [
      "Aircodiagnose bij storing",
      "Visuele inspectie met temperatuurmeting",
      "Airco reinigen",
      "Koudemiddel (R134a) afzuigen, recyclen en bijvullen met de juiste hoeveelheid compressorolie",
      "Lektest met droge stikstof; interieurfilter controleren en zo nodig vervangen",
    ],
    benefits: ["Koele lucht zonder nare geurtjes", "Beter zicht: ruiten beslaan minder snel", "Advies op het juiste moment (bij voorkeur in het voorjaar)"],
    process: [
      { title: "Afspraak", detail: "Plan een aircocontrole of -reiniging in." },
      { title: "Controle & service", detail: "Wij meten, reinigen en vullen de airco bij; we testen op lekkages." },
      { title: "Advies", detail: "U hoort of het interieurfilter of ander onderhoud nodig is." },
    ],
    faq: [
      {
        q: "Hoe vaak moet airco-onderhoud?",
        a: "Wij adviseren de airco elke 12 maanden te laten controleren. Het interieurfilter slijt en vraagt regelmatig aandacht.",
      },
      {
        q: "Werken jullie ook met nieuwere koudemiddelen?",
        a: "Wij werken met R134a. Rijdt u een auto met een ander koudemiddel? Neem even contact op, dan bespreken we de mogelijkheden. (TODO: bevestigen met klant.)",
      },
    ],
    related: ["onderhoud", "kleine-beurt", "bandenservice"],
    seo: {
      title: "Aircoservice Utrecht — airco reinigen & bijvullen | Fix-it All",
      description:
        "Aircoservice in Utrecht: reinigen, controleren en bijvullen (R134a). Koele lucht zonder nare geurtjes. Advies elke 12 maanden. Maak een afspraak.",
    },
  },
  {
    slug: "bandenservice",
    title: "Bandenservice",
    shortLabel: "Bandenservice",
    icon: CircleDot,
    summary: "Monteren, balanceren, reparatie en opslag — plus gratis bandenadvies.",
    intro:
      "Banden leggen het contact met het wegdek: goede grip en een perfecte wegligging zijn van groot belang voor uw veiligheid. Het bandenassortiment van Fix-it All bestaat uit een gevarieerd aanbod van topmerken, waarbij kwaliteit en veiligheid vooropstaan.",
    includes: [
      "Banden (de)monteren",
      "Balanceren",
      "Bandenreparatie",
      "Bandenopslag",
      "Velgen spuiten",
      "Gratis bandenadvies",
    ],
    benefits: ["Topmerken en gevarieerd aanbod", "Gratis bandenadvies", "Veilig de weg op met goede grip"],
    process: [
      { title: "Advies", detail: "Vertel ons waarvoor u de banden gebruikt; wij adviseren gratis." },
      { title: "Service", detail: "Wij monteren, balanceren of repareren uw banden." },
      { title: "Opslag", detail: "Zomer- of winterbanden bewaren? Wij bieden bandenopslag." },
    ],
    faq: [
      {
        q: "Controleren jullie ook de bandenspanning?",
        a: "Ja. Tip: controleer de spanning elke 14 dagen en alleen bij koude banden. Vergeet het reservewiel niet.",
      },
      {
        q: "Kan ik mijn banden laten opslaan?",
        a: "Ja, wij bieden bandenopslag zodat u uw zomer- of winterset veilig bij ons kunt bewaren.",
      },
    ],
    related: ["onderhoud", "apk-keuring", "airco-service"],
    seo: {
      title: "Bandenservice Utrecht — monteren, balanceren & opslag | Fix-it All",
      description:
        "Bandenservice in Utrecht: (de)monteren, balanceren, reparatie, opslag en velgen spuiten. Gratis bandenadvies en topmerken. Maak een afspraak.",
    },
  },
  {
    slug: "reparatie",
    title: "Autoreparatie in Utrecht",
    shortLabel: "Reparatie",
    icon: Hammer,
    summary: "Herstel van storingen en gebreken voor alle merken — met eerlijk advies vooraf.",
    intro:
      "Heeft uw auto een concrete klacht of storing? Onze gediplomeerde monteurs herstellen reparaties voor alle merken. We bekijken de klacht, bespreken vooraf wat er nodig is en voeren de reparatie vakkundig uit.",
    includes: [
      "Reparatie voor alle merken",
      "Herstel van een concrete klacht of storing",
      "Kosten en aanpak vooraf in overleg",
    ],
    benefits: ["Voor alle merken", "Eerlijk advies en overleg vooraf", "Gediplomeerde monteurs"],
    process: [
      { title: "Klacht bespreken", detail: "Vertel ons wat er aan de hand is, of laat ons de auto onderzoeken." },
      { title: "Overleg", detail: "Wij bespreken de aanpak en de kosten vóórdat we beginnen." },
      { title: "Reparatie", detail: "Na uw akkoord voeren we de reparatie vakkundig uit." },
    ],
    faq: [
      {
        q: "Repareren jullie ook mijn merk?",
        a: "Ja, Fix-it All werkt aan alle merken.",
      },
      {
        q: "Weet ik vooraf wat het kost?",
        a: "We bespreken de aanpak en de kosten altijd eerst met u. Pas na uw akkoord starten we de reparatie. (Exacte prijzen zijn afhankelijk van de klacht — TODO: standaardtarieven bevestigen met klant.)",
      },
    ],
    related: ["diagnose", "onderhoud", "uitlaat-laswerk"],
    seo: {
      title: "Autoreparatie Utrecht — alle merken | Fix-it All",
      description:
        "Autoreparatie in Utrecht voor alle merken. Gediplomeerde monteurs, eerlijk advies en kosten vooraf in overleg. Neem contact op of maak een afspraak.",
    },
  },
  {
    slug: "diagnose",
    title: "Diagnose & storing zoeken",
    shortLabel: "Diagnose",
    icon: ScanLine,
    summary: "Waarschuwingslampje of storing? Wij zoeken met moderne apparatuur de oorzaak op.",
    intro:
      "Brandt er een waarschuwingslampje of heeft uw auto een onduidelijke storing? Met moderne diagnoseapparatuur zoeken wij de oorzaak op, zodat we gericht kunnen adviseren over de vervolgstappen.",
    includes: [
      "Uitlezen en onderzoeken van storingen",
      "Diagnose met moderne apparatuur",
      "Gericht advies over de vervolgstappen",
    ],
    benefits: ["Gerichte aanpak in plaats van gokken", "Eerlijk advies over de vervolgstappen", "Moderne diagnosetechniek"],
    process: [
      { title: "Afspraak", detail: "Meld de klacht of het waarschuwingslampje en plan een moment in." },
      { title: "Diagnose", detail: "Wij lezen de auto uit en onderzoeken de oorzaak." },
      { title: "Advies", detail: "U hoort wat er speelt en wat de mogelijke vervolgstappen zijn." },
    ],
    faq: [
      {
        q: "Mijn motorlampje brandt — is dat erg?",
        a: "Niet altijd, maar het is verstandig het te laten uitlezen. Zo voorkomt u dat een klein probleem groter wordt. Maak een afspraak voor een diagnose.",
      },
      {
        q: "Wat kost een diagnose?",
        a: "Dat hangt af van de klacht en het benodigde onderzoek. Neem contact op voor meer informatie. (TODO: tarief bevestigen met klant.)",
      },
    ],
    related: ["reparatie", "onderhoud", "airco-service"],
    seo: {
      title: "Autodiagnose Utrecht — storing & waarschuwingslampje | Fix-it All",
      description:
        "Autodiagnose in Utrecht: waarschuwingslampje of storing laten uitlezen met moderne apparatuur. Gericht advies over de vervolgstappen. Maak een afspraak.",
    },
  },
];

const bySlug = new Map(services.map((s) => [s.slug, s]));

export const getService = (slug: string): Service | undefined => bySlug.get(slug);

/** Volgorde van diensten in nav-dropdown en overzicht. */
export const serviceOrder = services.map((s) => s.slug);
