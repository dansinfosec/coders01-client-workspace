// SERVICES — 12 diensten from the client's site. `intro` values are VERIFIED
// (the site's own meta/service descriptions, lightly polished). Where the
// crawled page had substantial body copy, richer `sections` are included; other
// services keep a concise, factual summary. Add more sections from scraped/ as
// pages are fleshed out — nothing here is invented.

export const services = [
  {
    slug: 'daklekkage',
    title: 'Daklekkage',
    short: 'Snel de oorzaak opsporen en duurzaam herstellen.',
    intro:
      'Heeft u last van een daklekkage? Wij sporen de oorzaak snel op en zorgen voor een duurzame oplossing om vervolgschade te voorkomen.',
    image: '/images/service-daklekkage.jpg',
    featured: true,
    sections: [
      {
        heading: 'Wat doen wij bij een lekkage?',
        body: [
          'Bij een daklekkage plannen we zo snel mogelijk een afspraak in. Zeker bij heftige lekkages begrijpen we dat u snel geholpen wilt worden.',
          'We inspecteren het probleem en brengen indien mogelijk direct een tijdelijke oplossing aan om verdere schade te voorkomen. Daarna onderzoeken we wat er nodig is — van een kleine herstelling tot het vervangen van een groter deel van het dak.',
        ],
      },
      {
        heading: 'Kan uw verzekering helpen?',
        body: [
          'In veel gevallen wordt schade door een daklekkage (deels) vergoed door uw opstalverzekering, vooral bij stormschade of een onverwachte lekkage.',
          'Wij helpen u graag met een rapport of schadeverklaring, zodat u de schade eenvoudig bij uw verzekeraar kunt melden.',
        ],
      },
    ],
  },
  {
    slug: 'dak-renovatie',
    title: 'Dak renovatie',
    short: 'Uw dak als geheel vernieuwd, met oog voor isolatie en levensduur.',
    intro:
      'Is uw platte of hellende dak aan vernieuwing toe? Kies voor een professionele dakrenovatie met oog voor isolatie, veiligheid en een lange levensduur.',
    image: '/images/service-dak-renovatie.jpg',
    featured: true,
    sections: [
      {
        heading: 'Wat is een dakrenovatie precies?',
        body: [
          'Bij een dakrenovatie wordt (een groot deel van) uw dak vernieuwd. Dat kan nodig zijn door slijtage, schade, lekkage of isolatieproblemen. Anders dan bij een kleine reparatie pakken we het dak als geheel aan.',
        ],
      },
      {
        heading: 'Meer comfort én lagere energiekosten',
        body: [
          'Een renovatie is hét moment om extra isolatie aan te brengen. Zeker bij oudere woningen verdwijnt veel warmte via het dak. Met isolatie verhoogt u het wooncomfort en bespaart u op energiekosten.',
          'In sommige gevallen komt u in aanmerking voor subsidie of een lager btw-tarief. Hierbij helpen wij u graag.',
        ],
      },
    ],
  },
  {
    slug: 'platte-daken',
    title: 'Platte daken',
    short: 'Aanleg, renovatie en reparatie van platte daken.',
    intro:
      'Wij specialiseren ons in de aanleg, renovatie en reparatie van platte daken. Duurzaam, waterdicht en professioneel afgewerkt.',
    image: '/images/service-platte-daken.jpg',
    featured: true,
    sections: [
      {
        heading: 'Soorten platte daken en materialen',
        body: [
          'Bitumen is een beproefde, voordelige oplossing die waterdicht is zolang de afdeklaag intact blijft. EPDM is een rubberachtige, zeer duurzame oplossing met een lange levensduur. Zink of kunststof wordt vaak gebruikt bij kleine daken of moderne ontwerpen.',
          'Elk materiaal heeft eigen eigenschappen. Tijdens onze inspectie kijken we welk materiaal het beste bij uw dak past.',
        ],
      },
      {
        heading: 'Onderhoud voorkomt dure herstellingen',
        body: [
          'Jaarlijks onderhoud voorkomt dat kleine problemen groter worden. Door uw platte dak eens per jaar te laten inspecteren verlengt u de levensduur en voorkomt u dure herstellingen.',
        ],
      },
    ],
  },
  {
    slug: 'dak-reparatie',
    title: 'Dak reparatie',
    short: 'Van kleine scheuren tot grotere schade — snel en vakkundig.',
    intro:
      'Van kleine scheuren tot grotere schade: wij zorgen voor een snelle en vakkundige dakreparatie, zodat uw dak weer jaren meegaat.',
    image: '/images/service-dak-reparatie.jpg',
    featured: true,
  },
  {
    slug: 'bitumen-dak',
    title: 'Bitumen dak',
    short: 'Voordelen, levensduur en toepassingen van bitumen dakbedekking.',
    intro:
      'Overweegt u een bitumen dak? Lees meer over de voordelen, levensduur en toepassingen van bitumen dakbedekking bij renovatie of nieuwbouw.',
    image: '/images/service-bitumen-dak.jpg',
    featured: true,
  },
  {
    slug: 'dak-isoleren',
    title: 'Dak isoleren',
    short: 'Energiezuiniger wonen en lagere energiekosten.',
    intro:
      'Wilt u uw woning energiezuiniger maken? Ontdek de mogelijkheden voor dakisolatie en verlaag uw energiekosten aanzienlijk.',
    image: '/images/service-dak-isoleren.jpg',
    featured: true,
  },
  {
    slug: 'dakkapel-renovatie',
    title: 'Dakkapel renovatie',
    short: 'Een nette, veilige en goed geïsoleerde afwerking.',
    intro:
      'Is uw dakkapel verouderd of beschadigd? Laat deze renoveren door onze specialisten voor een nette, veilige en goed geïsoleerde afwerking.',
    image: '/images/service-dakkapel-renovatie.jpg',
  },
  {
    slug: 'dakgoot-renovatie',
    title: 'Dakgoot renovatie',
    short: 'Goede waterafvoer en een nette afwerking.',
    intro:
      'Zijn uw dakgoten aan vervanging toe? Wij renoveren uw dakgoten en zorgen voor een goede waterafvoer en een nette afwerking.',
    image: '/images/service-dakgoot-renovatie.jpg',
  },
  {
    slug: 'dakraam-plaatsen',
    title: 'Dakraam plaatsen',
    short: 'Meer licht op zolder, vakkundig geplaatst.',
    intro:
      'Meer licht op zolder? Wij plaatsen dakramen vakkundig en zorgen voor een perfecte aansluiting met uw dakconstructie.',
    image: '/images/service-dakraam-plaatsen.jpg',
  },
  {
    slug: 'nokvorst-renovatie',
    title: 'Nokvorst renovatie',
    short: 'Voorkom lekkages door tijdige renovatie.',
    intro:
      'Losliggende of beschadigde nokvorsten? Laat ze tijdig renoveren om lekkages en dakschade te voorkomen.',
    image: '/images/service-nokvorst-renovatie.jpg',
  },
  {
    slug: 'schoorsteen-renovatie',
    title: 'Schoorsteen renovatie',
    short: 'Een veilige en waterdichte afwerking.',
    intro:
      'Zit er schade aan uw schoorsteen? Onze experts voeren een grondige renovatie uit voor een veilige en waterdichte afwerking.',
    image: '/images/service-schoorsteen-renovatie.jpg',
  },
  {
    slug: 'stormschade',
    title: 'Stormschade',
    short: 'Snel ter plaatse om schade te beoordelen en herstellen.',
    intro:
      'Stormschade aan uw dak? Wij zijn snel ter plaatse om de schade te beoordelen en direct te herstellen waar nodig.',
    image: '/images/service-stormschade.jpg',
    featured: true,
  },
]

export const getService = (slug) => services.find((s) => s.slug === slug)
export const featuredServices = services.filter((s) => s.featured)
