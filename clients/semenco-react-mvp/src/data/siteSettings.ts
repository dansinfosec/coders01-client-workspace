import type { SiteSettings } from "@/types/content";

/**
 * Global site settings. Values verified from the live Sem & Co website
 * (see scraped-data/reports/content-inventory.md).
 */
export const siteSettings: SiteSettings = {
  name: "Sem & Co",
  // Verified tagline (site title / meta).
  tagline: "Kleinschalige logeeropvang met echte aandacht",
  sourceUrl: "https://semenco.nl/",
  locale: "nl",
  defaultOgImage: "/images/semenco/hero/bospark-buitenspelen.jpg",
};

/** Short verified description of who Sem & Co is (reused in intros / SEO). */
export const siteIntro =
  "Sem & Co is een warme en huiselijke logeerplek voor kinderen en jongeren van 4 tot 18 jaar met extra ondersteuningsbehoeften, op vakantiepark RCN Het Grote Bos in Doorn.";
