/**
 * Central route path constants. Import these everywhere instead of hard-coding
 * strings so routes stay consistent across the router, navigation data and links.
 */
export const ROUTES = {
  home: "/",
  about: "/over-ons",
  logeeropvang: "/logeeropvang",
  vakantieopvang: "/vakantieopvang",
  crisisopvang: "/crisisopvang",
  werkwijze: "/werkwijze",
  aanmelden: "/aanmelden",
  blog: "/blog",
  contact: "/contact",
} as const;

/** Legacy path kept as a redirect to the current About route (do not remove). */
export const LEGACY_ABOUT_PATH = "/over-sem-en-co";

/** Build a blog post detail path from a slug. */
export const blogPostPath = (slug: string): string => `/blog/${slug}`;

/** The dynamic route pattern used when registering the blog detail route. */
export const BLOG_POST_PATTERN = "/blog/:slug";
