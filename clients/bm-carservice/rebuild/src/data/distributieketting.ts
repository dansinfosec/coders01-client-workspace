import type { LandingContent } from "./landing";

/**
 * Distributieketting is an explicit BM specialisation with per-brand landing pages
 * (VW/Audi/Seat/Skoda). All share one "vanaf" price table for TSI/TFSI engines.
 * Prijzen incl. btw en gratis leenauto, 12 maanden garantie, originele dealeronderdelen.
 * TODO: actualiteit bevestigen. 1.6 FSI stond in de bron als €975 én €1075 → laagste aangehouden.
 */
export const distributiekettingPrices: NonNullable<LandingContent["priceTable"]> = [
  { label: "1.0 TSI / TFSI", from: "€775" },
  { label: "1.2 TSI / TFSI", from: "€775" },
  { label: "1.4 TSI / TFSI", from: "€1075", note: "gemodificeerde set met nokkenasversteller" },
  { label: "1.6 FSI", from: "€975", note: "TODO: prijs bevestigen (bron: €975–€1075)" },
  { label: "1.8 TSI / TFSI", from: "€975" },
  { label: "2.0 TSI / TFSI", from: "€975" },
  { label: "3.2 TSI / TFSI V6", from: "€1575" },
];

export const distributiekettingHub: LandingContent = {
  slug: "distributieketting",
  path: "/distributieketting",
  eyebrow: "SPECIALISME · DISTRIBUTIEKETTING",
  title: "Distributieketting vervangen — VW, Audi, Seat & Skoda",
  summary: "TSI/TFSI distributieketting vervangen v.a. €775 — originele onderdelen, incl. leenauto.",
  intro:
    "Overzicht van de reparatiekosten voor alle TSI- en TFSI-motoren van Volkswagen, Audi, Seat en Skoda. Altijd originele dealeronderdelen, inclusief btw, gratis leenauto en 12 maanden garantie.",
  bullets: [
    "Originele dealeronderdelen: kettingset, geleiders, spanner, keerring, krukasbout, pakkingen",
    "Inclusief btw en gratis leenauto",
    "12 maanden garantie",
    "Gratis distributiekettingcheck en vrijblijvende offerte",
  ],
  priceTable: distributiekettingPrices,
  seoTitle: "Distributieketting vervangen VW/Audi/Seat/Skoda v.a. €775 | BM Carservice",
  seoDescription:
    "TSI/TFSI distributieketting vervangen bij BM Carservice Amstelveen v.a. €775, incl. btw en leenauto. Originele onderdelen en 12 maanden garantie voor VW, Audi, Seat en Skoda.",
};

export const distributiekettingBrands: LandingContent[] = [
  {
    slug: "distributieketting-vw",
    path: "/distributieketting/distributieketting-vw",
    eyebrow: "DISTRIBUTIEKETTING · VOLKSWAGEN",
    title: "Distributieketting Volkswagen vervangen",
    summary: "Distributieketting van elke Volkswagen vervangen — full-service prijs, gratis leenauto.",
    intro:
      "BM Carservice vervangt de distributieketting van alle Volkswagen-modellen met gemodificeerde, originele VAG-sets tegen een vaste full-service prijs.",
    bullets: [
      "Modellen o.a. Golf, Polo, Jetta, Passat, Scirocco, Sharan, Eos",
      "Originele VAG-set: geleiders, ketting, spanners, tandwielen, keerring",
      "Gratis leenauto en arbeid inbegrepen",
      "Klachten: geratel/rammel bij (koude) start, motormanagementlampje, misfire",
    ],
    models: ["Golf", "Polo", "Jetta", "Passat", "Scirocco", "Sharan", "Eos"],
    priceTable: distributiekettingPrices,
    seoTitle: "Distributieketting Volkswagen vervangen v.a. €775 | BM Carservice",
    seoDescription:
      "Distributieketting Volkswagen vervangen bij BM Carservice Amstelveen: alle modellen met originele VAG-onderdelen, full-service prijs v.a. €775 en gratis leenauto.",
  },
  {
    slug: "distributieketting-audi",
    path: "/distributieketting/distributieketting-audi",
    eyebrow: "DISTRIBUTIEKETTING · AUDI",
    title: "Distributieketting Audi vervangen",
    summary: "Audi TSI/TFSI distributieketting v.a. €775 — originele onderdelen, 12 mnd garantie.",
    intro:
      "BM Carservice vervangt de distributieketting van Audi TSI/TFSI-motoren met originele dealeronderdelen tegen scherpe, vaste tarieven.",
    bullets: [
      "Voor alle Audi TSI/TFSI-motoren (1.0 t/m 3.2 V6)",
      "Originele dealeronderdelen",
      "Inclusief btw en gratis leenauto",
      "A-kwaliteit met 12 maanden garantie",
    ],
    priceTable: distributiekettingPrices,
    seoTitle: "Distributieketting Audi vervangen v.a. €775 | BM Carservice",
    seoDescription:
      "Distributieketting Audi vervangen bij BM Carservice Amstelveen: TSI/TFSI motoren v.a. €775 incl. btw en leenauto. Originele onderdelen en 12 maanden garantie.",
  },
  {
    slug: "distributieketting-seat",
    path: "/distributieketting/distributieketting-seat",
    eyebrow: "DISTRIBUTIEKETTING · SEAT",
    title: "Distributieketting Seat vervangen",
    summary: "Distributieketting Seat (Ibiza, Leon, Altea, Toledo) — bespaar t.o.v. de dealer.",
    intro:
      "BM Carservice vervangt de distributieketting van alle Seat-modellen met originele onderdelen; bij TSI-motoren vaak met een gemodificeerde set.",
    bullets: [
      "Modellen o.a. Ibiza, Leon, Altea, Toledo",
      "TSI-ketting rekt door leeftijd, smering of een defecte spanner",
      "Originele dealeronderdelen, behoud van garantie",
      "Gratis leenauto",
    ],
    models: ["Ibiza", "Leon", "Altea", "Toledo"],
    priceTable: distributiekettingPrices,
    seoTitle: "Distributieketting Seat vervangen v.a. €775 | BM Carservice",
    seoDescription:
      "Distributieketting Seat vervangen bij BM Carservice Amstelveen: Ibiza, Leon, Altea en Toledo met originele onderdelen v.a. €775 incl. leenauto. Bespaar t.o.v. de dealer.",
  },
  {
    slug: "distributieketting-skoda",
    path: "/distributieketting/distributieketting-skoda",
    eyebrow: "DISTRIBUTIEKETTING · SKODA",
    title: "Distributieketting Skoda vervangen",
    summary: "Distributieketting Skoda (Yeti, Fabia, Octavia) — voordeliger dan de dealer.",
    intro:
      "BM Carservice vervangt de distributieketting van Skoda-modellen met originele onderdelen en ervaren monteurs, tegen scherpe tarieven.",
    bullets: [
      "Modellen o.a. Yeti, Fabia, Octavia",
      "1.2 TSI is gevoelig voor een uitgerekte ketting",
      "Signalen: lawaai bij koude start, oranje motorlampje, slecht lopen",
      "Originele VW-onderdelen, full-service prijs, gratis leenauto",
    ],
    models: ["Yeti", "Fabia", "Octavia"],
    priceTable: distributiekettingPrices,
    seoTitle: "Distributieketting Skoda vervangen v.a. €775 | BM Carservice",
    seoDescription:
      "Distributieketting Skoda vervangen bij BM Carservice Amstelveen: Yeti, Fabia en Octavia met originele onderdelen, voordeliger dan de dealer en incl. gratis leenauto.",
  },
];

export const getDistributiekettingBrand = (slug: string): LandingContent | undefined =>
  distributiekettingBrands.find((b) => b.slug === slug);
