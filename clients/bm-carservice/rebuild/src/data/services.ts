import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Wrench,
  BatteryCharging,
  Snowflake,
  Disc3,
  Settings2,
  Wind,
  CircleGauge,
  Cog,
  Link2,
  ScanLine,
  Gauge,
  Lightbulb,
  ThermometerSnowflake,
} from "lucide-react";

export interface Service {
  slug: string;
  /** Path override for services that keep a legacy top-level URL. Default: /diensten/:slug. */
  path?: string;
  title: string;
  icon: LucideIcon;
  /** One punchy line for cards (≤120 chars). */
  summary: string;
  /** 1–2 sentence intro on the detail page. */
  intro: string;
  bullets: string[];
  /** Short display price from the live site, shown as "vanaf". TODO: actualiteit bevestigen. */
  priceFrom?: string;
  seoTitle: string;
  seoDescription: string;
  /** true = featured on the homepage services grid. */
  featured?: boolean;
}

// Content paraphrased from the live site (crawl 2026-07-30). Prices are the site's "vanaf"
// tariffs — TODO: confirm they are current with the client before go-live.
export const services: Service[] = [
  {
    slug: "apk",
    title: "APK keuring",
    icon: ClipboardCheck,
    summary: "Transparante APK zonder verrassingen — reparaties altijd eerst in overleg.",
    intro:
      "Bij BM Carservice krijgt u een heldere APK zonder verborgen kosten. We keuren volgens de officiële eisen en melden zelf af bij de RDW. Reparaties overleggen we altijd vooraf.",
    bullets: [
      "Vaste tarieven: €44,95 benzine · €64,95 diesel, geen bijkomende kosten",
      "Gratis APK bij een grote beurt (alleen RDW-afmeldkosten)",
      "Klaar terwijl u wacht of gratis leenauto",
      "Controle van remmen, verlichting, banden, ruiten en spiegels",
      "Inclusief 4-gastest en koplampafstelling, daarna afmelden bij de RDW",
    ],
    priceFrom: "€44,95",
    seoTitle: "APK keuring Amstelveen — €44,95 | BM Carservice",
    seoDescription:
      "APK keuring in Amstelveen bij BM Carservice: transparant en voordelig, €44,95 benzine en €64,95 diesel. Gratis APK bij een grote beurt, klaar terwijl u wacht.",
    featured: true,
  },
  {
    slug: "onderhoud",
    title: "Auto onderhoud",
    icon: Wrench,
    summary: "Kleine en grote beurt volgens fabrieksvoorschriften — met behoud van garantie.",
    intro:
      "Regulier onderhoud houdt uw auto veilig, betrouwbaar en waardevast. We werken volgens de fabrieksintervallen met OEM-onderdelen, ook bij auto's met fabrieksgarantie.",
    bullets: [
      "Kleine beurt: ca. 25 controlepunten, olie en oliefilter verversen",
      "Grote beurt: uitgebreide controle, filters, bougies, motormanagement uitlezen",
      "Gratis APK in combinatie met een grote beurt",
      "A-kwaliteit / OEM-onderdelen, behoud van fabrieks- en mobiliteitsgarantie",
      "Altijd eerst overleg bij ontdekte gebreken",
    ],
    priceFrom: "€110",
    seoTitle: "Auto onderhoud Amstelveen — kleine & grote beurt | BM Carservice",
    seoDescription:
      "Auto onderhoud bij BM Carservice Amstelveen: kleine beurt v.a. €110 en grote beurt v.a. €169, volgens fabrieksvoorschriften met behoud van fabrieksgarantie.",
    featured: true,
  },
  {
    slug: "accu",
    title: "Accu testen & vervangen",
    icon: BatteryCharging,
    summary: "Gratis accutest en snelle vervanging met kwaliteitsmerken Bosch en Varta.",
    intro:
      "Start uw auto slecht of niet meer? Laat de accu gratis testen. We vervangen en leren accu's in, ook bij moderne start/stop-systemen.",
    bullets: [
      "Gratis accutest met moderne testapparatuur (alle types)",
      "Vervanging met scherpe prijzen; merken Bosch en Varta",
      "Inleren van de accu bij moderne auto's en start-stop",
      "Accupolen worden standaard gereinigd bij plaatsing",
      "Gemiddelde levensduur van een accu: 4 tot 6 jaar",
    ],
    seoTitle: "Accu testen en vervangen Amstelveen | BM Carservice",
    seoDescription:
      "Zwakke accu? BM Carservice Amstelveen biedt een gratis accutest en snelle vervanging met Bosch en Varta, ook voor start/stop-systemen.",
  },
  {
    slug: "aircoservice",
    title: "Aircoservice",
    icon: ThermometerSnowflake,
    summary: "Airco checken, reinigen en vullen — voorkom dure compressorschade.",
    intro:
      "Een auto-airco verliest jaarlijks koudemiddel; te weinig vulling beschadigt de compressor. Met jaarlijkse controle voorkomt u hoge kosten en houdt u frisse lucht.",
    bullets: [
      "Airco check: jaarlijkse controle op werking",
      "Airco fris: verdamper reinigen tegen bacteriën, schimmels en geurtjes",
      "Airco vullen: koudemiddel bijvullen voor volle koelcapaciteit",
      "Complete servicebeurt: reinigen en verversen (ca. 1× per 4 jaar)",
      "Handig in elk seizoen — koelen én ruiten sneller ontwasemen",
    ],
    seoTitle: "Aircoservice Amstelveen — check, reinigen & vullen | BM Carservice",
    seoDescription:
      "Aircoservice bij BM Carservice Amstelveen: airco check, reinigen, vullen en complete servicebeurt. Voorkom dure compressorschade met jaarlijks onderhoud.",
  },
  {
    slug: "autobanden",
    title: "Autobanden",
    icon: CircleGauge,
    summary: "Advies, vervangen, balanceren, uitlijnen, reparatie en seizoensopslag.",
    intro:
      "De staat van uw banden bepaalt veiligheid en comfort. We adviseren bij de keuze en verzorgen alle bandenservice — van montage tot opslag.",
    bullets: [
      "Banden vervangen (minimaal profiel 1,6 mm bij de APK)",
      "Balanceren voor betere wegligging en minder slijtage",
      "Uitlijnen bij scheeftrekken, na een stoeprand of nieuwe banden",
      "Wisselen elke ~15.000 km en lekke banden repareren",
      "Bandenopslag v.a. €40 per seizoen, bestellen via de webshop",
    ],
    priceFrom: "€40",
    seoTitle: "Autobanden Amstelveen — vervangen, balanceren, uitlijnen | BM Carservice",
    seoDescription:
      "Autobanden bij BM Carservice Amstelveen: advies, vervangen, balanceren, uitlijnen en reparatie. Bandenopslag v.a. €40 per seizoen en bestellen via de webshop.",
    featured: true,
  },
  {
    slug: "reparatie",
    title: "Autoreparatie",
    icon: Settings2,
    summary: "Deskundig en betaalbaar herstel van alle merken met 36 maanden garantie.",
    intro:
      "Een storing komt altijd ongelegen. We repareren alle merken vakkundig met moderne diagnoseapparatuur en A-kwaliteit onderdelen, met de kosten zoveel mogelijk vooraf bepaald.",
    bullets: [
      "Professionele diagnose-apparatuur voor de nieuwste auto's",
      "Alleen A-kwaliteit / OEM-onderdelen (Bosch, Brembo, Valeo, Gates, NGK)",
      "Kosten vooraf bepaald — geen verrassingen",
      "Ervaren, regelmatig bijgeschoolde monteurs",
      "36 maanden garantie op alle reparaties (arbeid en onderdelen)",
    ],
    seoTitle: "Autoreparatie Amstelveen — alle merken, 36 mnd garantie | BM Carservice",
    seoDescription:
      "Autoreparatie bij BM Carservice Amstelveen: deskundig en betaalbaar herstel van alle merken met A-kwaliteit onderdelen en 36 maanden garantie.",
    featured: true,
  },
  {
    slug: "uitlaat-vervangen",
    title: "Uitlaat vervangen",
    icon: Wind,
    summary: "Uitlaat repareren of vervangen met Bosal — 2 jaar garantie zonder kilometerlimiet.",
    intro:
      "Van einddemper tot katalysator: we herstellen of vervangen de uitlaat en monteren uitsluitend Bosal, marktleider in uitlaatsystemen.",
    bullets: [
      "Reparatie waar mogelijk (lassen, klem of ophangrubbers), anders vervangen",
      "Een goede uitlaat optimaliseert verbruik en beperkt geluid",
      "Tijdig herkennen van corrosie, vermogensverlies en schadelijke gassen",
      "Uitsluitend Bosal-uitlaten (marktleider vervangingsmarkt)",
      "2 jaar garantie zonder kilometerlimiet",
    ],
    seoTitle: "Uitlaat vervangen Amstelveen — Bosal, 2 jaar garantie | BM Carservice",
    seoDescription:
      "Uitlaat vervangen bij BM Carservice Amstelveen: reparatie of vervanging met Bosal en 2 jaar garantie zonder kilometerlimiet. Voorkom vermogensverlies.",
  },
  {
    slug: "remmen-vervangen",
    path: "/remmen-vervangen", // legacy top-level URL preserved for SEO
    title: "Remmen vervangen",
    icon: Disc3,
    summary: "Remmencheck en vervanging — cruciaal voor uw veiligheid.",
    intro:
      "Remmen horen bij de belangrijkste veiligheidsonderdelen. Laat ze op tijd controleren, bijvoorbeeld bij de jaarlijkse onderhoudsbeurt.",
    bullets: [
      "Controle van remblokken, remschijven, remschoenen en wielremcilinders",
      "Aandacht voor remvloeistof (verouderd = lager kookpunt, minder prestatie)",
      "Signalen: trillend stuur, ver in te trappen pedaal, piepend geluid",
      "Doorrijden beschadigt de schijven en maakt reparatie duurder",
    ],
    seoTitle: "Remmen vervangen Amstelveen — remmencheck | BM Carservice",
    seoDescription:
      "Remmen vervangen bij BM Carservice Amstelveen: remmencheck en vakkundige vervanging van remblokken, schijven en remvloeistof. Voor optimale veiligheid.",
  },
  {
    slug: "distributieriem-vervangen",
    title: "Distributieriem vervangen",
    icon: Cog,
    summary: "Tijdige vervanging voorkomt zware motorschade — gratis check.",
    intro:
      "De distributieriem moet na 5–10 jaar of 80.000–120.000 km vervangen worden. We controleren gratis en vervangen bij alle merken, inclusief waterpomp en spanrollen.",
    bullets: [
      "Gratis distributiecheck door RDW-gecertificeerde monteurs",
      "All-in prijs incl. waterpomp en spanrollen",
      "Vervanging verzegeld met sticker, oude set retour in doos",
      "Vandaag bellen = de volgende dag geholpen, met vervangend vervoer",
    ],
    priceFrom: "€249",
    seoTitle: "Distributieriem vervangen Amstelveen — v.a. €249 | BM Carservice",
    seoDescription:
      "Distributieriem vervangen bij BM Carservice Amstelveen: gratis check en vervanging v.a. €249 all-in, incl. waterpomp en spanrollen. Voorkom zware motorschade.",
  },
  {
    slug: "distributieketting-vervangen",
    title: "Distributieketting vervangen",
    icon: Link2,
    summary: "Snelle, vakkundige vervanging v.a. €580 all-in met gratis leenauto.",
    intro:
      "Geratel bij het starten wijst op een uitgerekte ketting of slechte kettingspanner. Tijdig vervangen voorkomt forse motorschade. Zie ook onze merkpagina's voor VW, Audi, Seat en Skoda.",
    bullets: [
      "Voor alle merken (o.a. BMW, Mercedes, Volkswagen, Audi, Seat, Skoda)",
      "RDW-gecertificeerde, ervaren monteurs",
      "All-in prijs met gratis leenauto",
      "Gratis distributiekettingcheck en vrijblijvende offerte",
      "Signalen: rammelend geluid, verkeerde timing, motormanagementlampje",
    ],
    priceFrom: "€580",
    seoTitle: "Distributieketting vervangen Amstelveen — v.a. €580 | BM Carservice",
    seoDescription:
      "Distributieketting vervangen bij BM Carservice Amstelveen: vakkundig v.a. €580 all-in met gratis leenauto en gratis check. Voorkom dure motorschade.",
    featured: true,
  },
  {
    slug: "storingsdiagnose",
    title: "Storingsdiagnose",
    icon: ScanLine,
    summary: "Foutcodes uitlezen en de échte oorzaak vinden met AUTEL-apparatuur.",
    intro:
      "Brandt er een controlelampje? We lezen alle merken uit met AUTEL en sporen de werkelijke oorzaak op — niet alleen de foutcode.",
    bullets: [
      "Uitlezen van alle merken en modellen met het AUTEL-systeem",
      "Diagnose gaat verder dan de foutcode: oorzaak opsporen en verhelpen",
      "Goed opgeleide, bijgeschoolde monteurs",
      "Ook relevant bij de APK (lampjes motor, remsysteem, airbag)",
    ],
    seoTitle: "Storingsdiagnose Amstelveen — uitlezen met AUTEL | BM Carservice",
    seoDescription:
      "Storingsdiagnose bij BM Carservice Amstelveen: alle merken uitlezen met AUTEL en de werkelijke oorzaak van de storing opsporen en verhelpen.",
  },
  {
    slug: "koppeling-vervangen",
    title: "Koppeling vervangen",
    icon: Gauge,
    summary: "Koppeling vervangen met A-kwaliteit onderdelen en 12 maanden garantie.",
    intro:
      "Slipt de koppeling of schakelt de auto zwaar? We vervangen de koppeling met A-kwaliteit onderdelen en 12 maanden garantie.",
    bullets: [
      "Signalen: slippen, trage acceleratie, zwaar pedaal, vreemde geluiden",
      "Vervanging van koppelingsplaat, druklager én drukgroep samen",
      "A-kwaliteit onderdelen, 12 maanden garantie",
      "Levensduur tot 200.000+ km, afhankelijk van gebruik",
    ],
    seoTitle: "Koppeling vervangen Amstelveen — 12 mnd garantie | BM Carservice",
    seoDescription:
      "Koppeling vervangen bij BM Carservice Amstelveen: met A-kwaliteit onderdelen en 12 maanden garantie. Herken slijtage op tijd en voorkom duurdere schade.",
  },
  {
    slug: "autolampen",
    title: "Autolampen vervangen",
    icon: Lightbulb,
    summary: "Autolampen vervangen zonder afspraak — passend bij uw type auto.",
    intro:
      "Een kapot lampje is een APK-afkeurpunt en een veiligheidsrisico. Kom zonder afspraak langs; we monteren direct de juiste lamp.",
    bullets: [
      "Alle types: groot licht, dimlicht, rem-, stads-, achter-, mist- en kentekenverlichting",
      "Een kapot lampje = APK-afkeurpunt en risico op een boete",
      "Uitleg over dimlicht, dagrijlichten (DRL) en mistlichten",
      "Tip: controleer uw verlichting 1× per maand",
    ],
    seoTitle: "Autolampen vervangen Amstelveen — zonder afspraak | BM Carservice",
    seoDescription:
      "Autolampen vervangen bij BM Carservice Amstelveen, ook zonder afspraak. De juiste lamp voor uw auto — voorkom een APK-afkeur en een boete.",
  },
  {
    slug: "winterbanden",
    title: "Winterbanden",
    icon: Snowflake,
    summary: "Meer grip onder 7 °C — breed assortiment A-merken en seizoensopslag.",
    intro:
      "Onder 7 °C bieden winterbanden veel meer grip en een kortere remweg. We adviseren en leveren een breed assortiment topmerken.",
    bullets: [
      "Betere grip en kortere remweg op sneeuw, ijs en koud/nat wegdek",
      "A-merken: Pirelli, Continental, Michelin, Dunlop, Goodyear, Vredestein",
      "Herkenbaar aan het winterlogo en de lamellen in het profiel",
      "Bestellen via de webshop en bandenopslag v.a. €40 per seizoen",
    ],
    priceFrom: "€40",
    seoTitle: "Winterbanden Amstelveen — A-merken & opslag | BM Carservice",
    seoDescription:
      "Winterbanden bij BM Carservice Amstelveen: meer grip onder 7 °C en een breed assortiment A-merken. Advies, montage en bandenopslag v.a. €40 per seizoen.",
  },
];

export const servicePath = (s: Pick<Service, "slug" | "path">): string =>
  s.path ?? `/diensten/${s.slug}`;

export const getService = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

export const featuredServices = services.filter((s) => s.featured);
