/**
 * Blog types. Designed so local TypeScript sample data can later be replaced by
 * API or CMS data without changing the UI components that consume it.
 */

export type BlogCategory =
  | "Nieuws"
  | "Verhalen"
  | "Praktisch"
  | "Voorbeeld"; // "Voorbeeld" = example/placeholder category

export interface BlogAuthor {
  name: string;
  /** Optional role, e.g. "Team Sem & Co". */
  role?: string;
}

export interface BlogPost {
  /** URL slug, used in /blog/:slug. */
  slug: string;
  title: string;
  /** Short summary for the overview cards and meta description fallback. */
  summary: string;
  /** Body content. Plain paragraphs for the scaffold (Markdown/rich text later). */
  content: string[];
  /** Featured image path in /public (optional until imagery is selected). */
  featuredImage?: string;
  /** Alt text for the featured image. */
  featuredImageAlt?: string;
  category: BlogCategory;
  tags: string[];
  author: BlogAuthor;
  /** ISO date string, e.g. "2025-01-15". */
  publishedAt: string;
  /** Estimated reading time in minutes (can be derived from content). */
  readingTimeMinutes: number;
  /** SEO overrides; fall back to title/summary when absent. */
  seoTitle?: string;
  metaDescription?: string;
  /** Draft posts are excluded from the public overview. */
  status: "draft" | "published";
  /** Marks clearly-fake sample content in the scaffold. */
  isExample: boolean;
}
