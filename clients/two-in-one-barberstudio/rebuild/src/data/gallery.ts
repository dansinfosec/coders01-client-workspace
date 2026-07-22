/**
 * Gallery images — Google Maps photos from the VERIFIED Two in one barberstudio
 * listing (Visseringlaan 19, Rijswijk). Optimized WebP live in
 * public/images/google-preview/ and are tracked so Vercel can display them; raw
 * downloads stay git-ignored. Attribution preserved per photo. These are
 * temporary preview assets — replace with owner-provided originals for production.
 */
export interface GalleryImage {
  src: string;
  alt: string;
  attribution: string;
  span?: boolean;
}

const P = "/images/google-preview";

export const heroImage = {
  src: `${P}/hero-interior.webp`,
  alt: "Interieur van Two in one barberstudio in Rijswijk met kappersstoelen en spiegels",
  attribution: "Two in one barberstudio (via Google Maps)",
};

export const gallery: GalleryImage[] = [
  {
    src: `${P}/storefront.webp`,
    alt: "De zaak van Two in one barberstudio aan de Visseringlaan in Rijswijk",
    attribution: "Two in one barberstudio (via Google Maps)",
    span: true,
  },
  {
    src: `${P}/fresh-cut-window.webp`,
    alt: "Klant met een vers geknipt kapsel bij het raam",
    attribution: "Yela Gan (via Google Maps)",
  },
  {
    src: `${P}/barber-portrait.webp`,
    alt: "Barbier van Two in one barberstudio",
    attribution: "Jeffrey Jack (via Google Maps)",
  },
  {
    src: `${P}/fresh-cut-fade.webp`,
    alt: "Strak afgewerkte fade, achteraanzicht",
    attribution: "Christopher O (via Google Maps)",
  },
  {
    src: `${P}/clippers-tools.webp`,
    alt: "Tondeuses en gereedschap van de barbier",
    attribution: "Two in one barberstudio (via Google Maps)",
  },
  {
    src: `${P}/interior-window.webp`,
    alt: "Sfeerbeeld van de barbershop",
    attribution: "Two in one barberstudio (via Google Maps)",
  },
];
