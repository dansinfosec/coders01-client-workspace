/** Shared shape for data-driven landing pages (APK locations, brands, chiptuning, ANWB). */
export interface LandingContent {
  slug: string;
  /** Full route path, e.g. "/apk-keuring-amsterdam". */
  path: string;
  /** Mono signage eyebrow, e.g. "APK · AMSTERDAM". */
  eyebrow: string;
  title: string;
  summary: string;
  intro: string;
  bullets: string[];
  seoTitle: string;
  seoDescription: string;
  /** Optional price rows for a "vanaf"-tabel (distributieketting). */
  priceTable?: Array<{ label: string; from: string; note?: string }>;
  /** Optional related model list (brand pages). */
  models?: string[];
  /** Optional key into lib/images for a supporting photo. */
  image?: import("@/lib/images").ImageKey;
}
