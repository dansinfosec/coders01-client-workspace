/** Curated site photos with intrinsic dimensions (for explicit width/height → no layout shift). */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const base = "/images/bm-carservice";

export const images = {
  workshopHero: {
    src: `${base}/workshop-hero.webp`,
    width: 2000,
    height: 798,
    alt: "De moderne werkplaats van BM Carservice met auto's op de brug",
  },
  workshopWide: {
    src: `${base}/workshop-wide.webp`,
    width: 1600,
    height: 998,
    alt: "Ruime, lichte werkplaats van BM Carservice in Amstelveen",
  },
  garageExterior: {
    src: `${base}/garage-exterior.webp`,
    width: 1000,
    height: 749,
    alt: "De garage van BM Carservice aan de Bouwerij in Amstelveen",
  },
  garageSign: {
    src: `${base}/garage-sign.webp`,
    width: 1400,
    height: 872,
    alt: "Gevel van BM Carservice met werkplaats en receptie",
  },
  reception: {
    src: `${base}/reception.webp`,
    width: 1000,
    height: 749,
    alt: "De receptie van BM Carservice",
  },
  workshopDetail: {
    src: `${base}/workshop-detail.webp`,
    width: 1200,
    height: 801,
    alt: "Monteur van BM Carservice aan het werk aan een motor",
  },
  carLift: {
    src: `${base}/car-lift.webp`,
    width: 1000,
    height: 749,
    alt: "Auto op de brug tijdens onderhoud bij BM Carservice",
  },
  anwbPechhulp: {
    src: `${base}/anwb-pechhulp.webp`,
    width: 1400,
    height: 787,
    alt: "BM Carservice als ANWB Partnerbedrijf bij pechhulp",
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
