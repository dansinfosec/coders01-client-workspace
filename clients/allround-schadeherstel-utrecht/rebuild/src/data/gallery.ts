/**
 * Gallery imagery.
 *
 * The verified Google listing returned ZERO usable business photos, so the
 * preview uses AI-generated atmosphere images (type: "ai"). These are NOT photos
 * of the real workshop, staff, customers or completed jobs — they illustrate the
 * kind of work only. Provenance is recorded per image here and disclosed in the
 * UI and in docs (SOURCE-REPORT.md / PREVIEW-NOTE.md). Before production they
 * must be approved by the owner or replaced with real company photos.
 *
 * Optimised WebP files live in public/images/ai-preview/ (raw generator drops are
 * gitignored). If an image type is ever "owner" or "google", record the correct
 * attribution/source alongside it.
 */
export interface GalleryImage {
  src: string;
  alt: string;
  type: "ai" | "google" | "owner";
  /** Human-readable provenance label (contributor / generator). */
  attribution: string;
  /** Machine source tag. */
  source: string;
  previewOnly: boolean;
  caption: string;
  /** Wider tile in the masonry grid. */
  span?: boolean;
}

const AI = "/images/ai-preview";

export const heroImage: GalleryImage = {
  src: `${AI}/hero-werkplaats.webp`,
  alt: "Sfeerimpressie van een moderne schadeherstelwerkplaats met een technicus die schade aan een auto beoordeelt",
  type: "ai",
  attribution: "AI-gegenereerde sfeerimpressie",
  source: "higgsfield",
  previewOnly: true,
  caption: "Sfeerimpressie",
};

export const gallery: GalleryImage[] = [
  {
    src: `${AI}/autoschade-herstel.webp`,
    alt: "Sfeerimpressie: technicus bereidt een beschadigd carrosseriepaneel van een auto voor op herstel",
    type: "ai",
    attribution: "AI-gegenereerde sfeerimpressie",
    source: "higgsfield",
    previewOnly: true,
    caption: "Autoschade — voorbereiding en herstel",
    span: true,
  },
  {
    src: `${AI}/motor-scooter-herstel.webp`,
    alt: "Sfeerimpressie: professioneel herstel en afwerking van panelen van een motor en scooter",
    type: "ai",
    attribution: "AI-gegenereerde sfeerimpressie",
    source: "higgsfield",
    previewOnly: true,
    caption: "Motor en scooter",
  },
  {
    src: `${AI}/vakmanschap-detail.webp`,
    alt: "Sfeerimpressie: close-up van nauwkeurige voorbereiding en lakafwerking op een voertuigpaneel",
    type: "ai",
    attribution: "AI-gegenereerde sfeerimpressie",
    source: "higgsfield",
    previewOnly: true,
    caption: "Vakmanschap in detail",
  },
  {
    src: `${AI}/boot-herstel.webp`,
    alt: "Sfeerimpressie: cosmetisch herstel en afwerking van schade aan een kleine bootromp",
    type: "ai",
    attribution: "AI-gegenereerde sfeerimpressie",
    source: "higgsfield",
    previewOnly: true,
    caption: "Bootschade",
  },
  {
    src: `${AI}/b2b-wagenpark.webp`,
    alt: "Sfeerimpressie: meerdere neutrale bedrijfsvoertuigen in een georganiseerde schadeherstelwerkplaats",
    type: "ai",
    attribution: "AI-gegenereerde sfeerimpressie",
    source: "higgsfield",
    previewOnly: true,
    caption: "Zakelijk en wagenpark",
    span: true,
  },
];

/** True when the gallery contains any AI atmosphere images (drives the disclosure line). */
export const galleryHasAi = gallery.some((g) => g.type === "ai") || heroImage.type === "ai";
