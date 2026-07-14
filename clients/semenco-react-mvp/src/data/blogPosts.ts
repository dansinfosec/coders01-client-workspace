import type { BlogPost } from "@/types/blog";

/**
 * Example blog posts (max 3). Clearly marked as placeholder content via
 * `isExample: true` and the "Voorbeeld" category. Replace with real articles
 * — or a CMS feed — later (see TODO.md → Blog). The UI reads only through the
 * helpers below, so the data source can change without UI edits.
 */
const posts: BlogPost[] = [
  {
    slug: "voorbeeld-welkom-bij-sem-en-co",
    title: "Voorbeeldartikel: Welkom bij Sem & Co",
    summary:
      "Example blog article — dit is voorbeeldtekst om de blogweergave te tonen. Te vervangen na scrape en redactie.",
    content: [
      "Example blog article. Deze alinea is placeholdertekst en bevat geen echte informatie over Sem & Co.",
      "Example blog article. Vervang deze inhoud door een geverifieerd, geredigeerd artikel voordat de site live gaat.",
    ],
    category: "Voorbeeld",
    tags: ["voorbeeld", "introductie"],
    author: { name: "Team Sem & Co", role: "Voorbeeldauteur" },
    publishedAt: "2025-01-06",
    readingTimeMinutes: 2,
    status: "published",
    isExample: true,
  },
  {
    slug: "voorbeeld-een-dag-bij-de-logeeropvang",
    title: "Voorbeeldartikel: Een dag bij de logeeropvang",
    summary:
      "Example blog article — voorbeeld van een verhalend artikel. Inhoud te verifiëren en te herschrijven.",
    content: [
      "Example blog article. Placeholderbeschrijving van een dag, uitsluitend bedoeld om de lay-out te demonstreren.",
      "Example blog article. Nog geen echte details — deze worden later toegevoegd na overleg met de klant.",
    ],
    category: "Voorbeeld",
    tags: ["voorbeeld", "verhalen"],
    author: { name: "Team Sem & Co" },
    publishedAt: "2025-01-13",
    readingTimeMinutes: 3,
    status: "published",
    isExample: true,
  },
  {
    slug: "voorbeeld-veelgestelde-vragen-over-aanmelden",
    title: "Voorbeeldartikel: Veelgestelde vragen over aanmelden",
    summary:
      "Example blog article — voorbeeld van een praktisch artikel. Antwoorden nog te bevestigen.",
    content: [
      "Example blog article. Placeholder-Q&A ter illustratie van de opmaak.",
      "Example blog article. Vervang door geverifieerde informatie over het aanmeldproces.",
    ],
    category: "Voorbeeld",
    tags: ["voorbeeld", "praktisch", "aanmelden"],
    author: { name: "Team Sem & Co" },
    publishedAt: "2025-01-20",
    readingTimeMinutes: 2,
    status: "published",
    isExample: true,
  },
];

/** All published posts, newest first. */
export function getPublishedPosts(): BlogPost[] {
  return posts
    .filter((p) => p.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Look up a single post by slug (published or draft). */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
