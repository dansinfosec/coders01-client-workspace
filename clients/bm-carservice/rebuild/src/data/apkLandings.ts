import type { LandingContent } from "./landing";

/**
 * APK is BM's headline proposition ("zonder afspraak"). The hub lives at /apk-zonder-afspraak;
 * the location/variant landing pages keep their exact existing URLs (1:1, no redirects) for SEO.
 * Content paraphrased from the live site. Tarieven "vanaf" — TODO: actualiteit bevestigen.
 */

export const apkHub: LandingContent = {
  slug: "apk-zonder-afspraak",
  path: "/apk-zonder-afspraak",
  eyebrow: "APK · ZONDER AFSPRAAK",
  title: "APK zonder afspraak in Amstelveen",
  summary: "RDW-erkende APK zonder afspraak — €44,95 benzine, €64,95 diesel, klaar terwijl u wacht.",
  intro:
    "Bij BM Carservice in Amstelveen kunt u zonder afspraak terecht voor een betrouwbare, voordelige APK. Verplicht voor elke auto ouder dan drie jaar — wij keuren en melden zelf af bij de RDW.",
  bullets: [
    "Zonder afspraak, klaar terwijl u wacht of met gratis leenauto",
    "Vaste tarieven: €44,95 benzine · €64,95 diesel, geen bijkomende kosten",
    "RDW-erkende garage die zelf afmeldt",
    "Extra accu- en distributiecheck tijdens de keuring",
    "Geen reparatie zonder uw akkoord",
    "Gratis APK in combinatie met een grote beurt",
  ],
  seoTitle: "APK zonder afspraak Amstelveen — €44,95 | BM Carservice",
  seoDescription:
    "APK zonder afspraak in Amstelveen bij BM Carservice: RDW-erkend, €44,95 benzine en €64,95 diesel, klaar terwijl u wacht en gratis APK bij een grote beurt.",
};

export const apkLandings: LandingContent[] = [
  {
    slug: "apk-keuring-amsterdam",
    path: "/apk-keuring-amsterdam",
    eyebrow: "APK · AMSTERDAM",
    title: "APK keuring Amsterdam",
    summary: "Voordelige RDW-erkende APK voor Amsterdam — €44,95 benzine, €64,95 diesel.",
    intro:
      "BM Carservice verzorgt betrouwbare APK keuringen voor klanten uit Amsterdam, zonder afspraak en tegen een vast laag tarief. Op een steenworp afstand in Amstelveen.",
    bullets: [
      "Voor auto's ouder dan 3 jaar",
      "Standaard APK-controlepunten + 4-gastest en koplampafstelling",
      "RDW-erkende keuringsinstantie",
      "Zonder afspraak of op afspraak",
      "Geen reparatie zonder overleg",
    ],
    seoTitle: "APK keuring Amsterdam — €44,95, RDW-erkend | BM Carservice",
    seoDescription:
      "APK keuring Amsterdam bij BM Carservice: RDW-erkend en voordelig, €44,95 benzine en €64,95 diesel. Zonder afspraak, geen reparatie zonder uw akkoord.",
  },
  {
    slug: "apk-keuring-aalsmeer",
    path: "/apk-keuring-aalsmeer",
    eyebrow: "APK · AALSMEER",
    title: "APK keuring Aalsmeer",
    summary: "Betrouwbare APK voor de regio Aalsmeer — €44,95 benzine, €64,95 diesel.",
    intro:
      "Vanuit Amstelveen bedient BM Carservice de regio Aalsmeer met betrouwbare, voordelige APK keuringen, ook zonder afspraak.",
    bullets: [
      "Voor auto's ouder dan 3 jaar",
      "Standaardcontrole + 4-gastest, koplampafstelling, accu- en distributiecheck",
      "RDW-erkend en gecontroleerd",
      "Zonder afspraak",
      "Gratis APK bij een grote beurt",
    ],
    seoTitle: "APK keuring Aalsmeer — €44,95, RDW-erkend | BM Carservice",
    seoDescription:
      "APK keuring in de regio Aalsmeer bij BM Carservice Amstelveen: RDW-erkend, €44,95 benzine en €64,95 diesel, zonder afspraak en gratis bij een grote beurt.",
  },
  {
    slug: "apk-keuring-uithoorn",
    path: "/apk-keuring-uithoorn",
    eyebrow: "APK · UITHOORN",
    title: "APK keuring Uithoorn",
    summary: "Betrouwbare APK voor de regio Uithoorn — €44,95 benzine, €64,95 diesel.",
    intro:
      "BM Carservice in Amstelveen voert betrouwbare, voordelige APK keuringen uit voor de regio Uithoorn, met of zonder afspraak.",
    bullets: [
      "Voor auto's ouder dan 3 jaar",
      "Standaardcontrole + 4-gastest, koplampafstelling, accu- en distributiecheck",
      "RDW-erkend en gecontroleerd",
      "Zonder afspraak",
      "Gratis APK bij een grote beurt",
    ],
    seoTitle: "APK keuring Uithoorn — €44,95, RDW-erkend | BM Carservice",
    seoDescription:
      "APK keuring in de regio Uithoorn bij BM Carservice Amstelveen: RDW-erkend, €44,95 benzine en €64,95 diesel, zonder afspraak en gratis bij een grote beurt.",
  },
  {
    slug: "apk-check-amstelveen",
    path: "/apk-zonder-afspraak/apk-check-amstelveen",
    eyebrow: "APK · CHECK AMSTELVEEN",
    title: "APK check Amstelveen",
    summary: "Goedkope APK check volgens de keuringseisen — klaar terwijl u wacht.",
    intro:
      "Moet uw kenteken binnenkort gekeurd worden? BM Carservice doet de APK check in Amstelveen tegen vaste tarieven, zonder afspraak.",
    bullets: [
      "Vaste tarieven: €44,95 benzine · €64,95 diesel",
      "Volgens de officiële APK-keuringseisen",
      "Zonder afspraak, klaar terwijl u wacht",
      "Reparaties altijd vooraf gemeld",
      "Gratis APK bij een grote beurt",
    ],
    seoTitle: "APK check Amstelveen — €44,95 | BM Carservice",
    seoDescription:
      "APK check Amstelveen bij BM Carservice: goedkoop en volgens de keuringseisen, €44,95 benzine en €64,95 diesel. Zonder afspraak en klaar terwijl u wacht.",
  },
  {
    slug: "apk-auto-amstelveen",
    path: "/apk-zonder-afspraak/apk-auto-amstelveen",
    eyebrow: "APK · AUTO AMSTELVEEN",
    title: "APK voor uw auto in Amstelveen",
    summary: "APK zonder afspraak in Amstelveen — met gratis leenauto.",
    intro:
      "Verloopt uw APK? Kom zonder afspraak langs. BM Carservice keurt tegen de laagste kosten en biedt een gratis leenauto of klaar terwijl u wacht.",
    bullets: [
      "Vaste tarieven: €44,95 benzine · €64,95 diesel, geen bijkomende kosten",
      "Gratis leenauto beschikbaar tijdens de keuring",
      "Klaar terwijl u wacht",
      "Reparaties altijd vooraf overlegd",
      "Gratis APK bij een grote beurt",
    ],
    seoTitle: "APK auto Amstelveen — zonder afspraak, gratis leenauto | BM Carservice",
    seoDescription:
      "APK voor uw auto in Amstelveen bij BM Carservice: zonder afspraak, €44,95 benzine en €64,95 diesel, met gratis leenauto of klaar terwijl u wacht.",
  },
];

export const getApkLanding = (slug: string): LandingContent | undefined =>
  apkLandings.find((l) => l.slug === slug);
