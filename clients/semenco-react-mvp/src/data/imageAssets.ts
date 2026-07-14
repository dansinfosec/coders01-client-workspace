/**
 * Central image registry. Every image used in the app is keyed here with its
 * local path, alt text, intrinsic dimensions (for stable aspect ratios / no
 * layout shift) and the public source URL it was downloaded from.
 *
 * Alt text is written conservatively: it never names or identifies the people
 * shown, because the source does not confirm identities. See
 * `scraped-data/reports/asset-manifest.md` for provenance and notes.
 *
 * Only a few images are available from the current (largely JS-rendered) site.
 * Additional approved photography (accommodation, activities, team, location)
 * is still needed — tracked in TODO.md → Design.
 */

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  sourceUrl?: string;
}

export const imageAssets = {
  logo: {
    src: "/images/semenco/brand/semenco-logo.png",
    alt: "Sem & Co",
    width: 400,
    height: 286,
    sourceUrl: "https://semenco.nl/wp-content/uploads/2025/12/Sem-Co-logo.png",
  },
  homeHero: {
    src: "/images/semenco/hero/bospark-buitenspelen.jpg",
    alt: "Buitenspelen bij een houten schommel tussen de bomen op het bospark, met een bungalow op de achtergrond",
    width: 1089,
    height: 1089,
    sourceUrl: "https://semenco.nl/wp-content/uploads/2025/12/Deze-gebruiken.jpg",
  },
  partnerBpsw: {
    src: "/images/semenco/misc/partner-bpsw.png",
    alt: "BPSW",
    width: 133,
    height: 108,
    sourceUrl: "https://semenco.nl/wp-content/uploads/2026/03/BPSW-logo-website.png",
  },
  partnerInspectie: {
    src: "/images/semenco/misc/partner-inspectie.png",
    alt: "Inspectie",
    width: 259,
    height: 117,
    sourceUrl: "https://semenco.nl/wp-content/uploads/2026/03/LOGO-inspectie-website.png",
  },
  partnerKlachtenportaal: {
    src: "/images/semenco/misc/partner-klachtenportaal.png",
    alt: "Klachtenportaal",
    width: 362,
    height: 107,
    sourceUrl: "https://semenco.nl/wp-content/uploads/2026/03/Logo-Klachtenportaal-website.png",
  },
  partnerSpoor030: {
    src: "/images/semenco/misc/partner-spoor030.png",
    alt: "Spoor030",
    width: 248,
    height: 111,
    sourceUrl: "https://semenco.nl/wp-content/uploads/2026/03/Logo-Spoor030-website.png",
  },
} as const satisfies Record<string, ImageAsset>;

export type ImageAssetKey = keyof typeof imageAssets;

/** Partner / quality logos shown on the live site (usage to be confirmed with client). */
export const partnerLogos: ImageAsset[] = [
  imageAssets.partnerBpsw,
  imageAssets.partnerSpoor030,
  imageAssets.partnerKlachtenportaal,
  imageAssets.partnerInspectie,
];
