/**
 * Gallery images — TEMPORARY Google Maps preview photos.
 * These live in public/images/google-preview/. Only the optimized .webp files are
 * tracked in Git (raw drops stay ignored); they MUST be replaced with
 * owner-provided originals before production. Attribution preserved per photo
 * (Google Maps contributor). See PREVIEW-NOTE.md.
 */
export interface GalleryImage {
  src: string;
  alt: string;
  /** Google Maps photo attribution (contributor display name). */
  attribution: string;
  span?: boolean; // wider tile in the masonry grid
}

const P = "/images/google-preview";

export const heroImage = {
  src: `${P}/hero-interior-barber.webp`,
  alt: "Interieur van barbershop Gentleman's Touch met een barbier aan het werk",
  attribution: "Gentleman's touch (via Google Maps)",
};

export const gallery: GalleryImage[] = [
  {
    src: `${P}/storefront-sign.webp`,
    alt: "Gevel van Gentleman's Touch met het bord 'Luxury Men's Grooming' in Vlaardingen",
    attribution: "Gentleman's touch (via Google Maps)",
    span: true,
  },
  {
    src: `${P}/haircut-curly-fade.webp`,
    alt: "Vers geknipt herenkapsel met krullen en strakke fade",
    attribution: "Gentleman's touch (via Google Maps)",
  },
  {
    src: `${P}/barber-at-work.webp`,
    alt: "Barbier die geconcentreerd een klant knipt bij Gentleman's Touch",
    attribution: "Gentleman's touch (via Google Maps)",
  },
  {
    src: `${P}/beard-trim.webp`,
    alt: "Baard vakkundig bijgewerkt door een barbier",
    attribution: "Gentleman's touch (via Google Maps)",
  },
  {
    src: `${P}/kids-haircut-design.webp`,
    alt: "Kinderkapsel met een fijn ingeschoren design",
    attribution: "Gentleman's touch (via Google Maps)",
  },
  {
    src: `${P}/fresh-fade-back.webp`,
    alt: "Achterzijde van een strak afgewerkte fade",
    attribution: "Gentleman's touch (via Google Maps)",
  },
  {
    src: `${P}/interior-detail.webp`,
    alt: "Sfeervol interieurdetail in de barbershop",
    attribution: "Mohammad Karam (via Google Maps)",
  },
];
