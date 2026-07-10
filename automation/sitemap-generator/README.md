# sitemap-generator

**Stage 3–4** tool. Builds and normalizes sitemaps and URL maps.

Responsibilities:
- Parse an existing `sitemap.xml` (or derive one from the crawl).
- Produce a clean URL inventory and old→new URL map for redirects.
- Emit a `sitemap.xml` for the rebuilt site.

Writes to `clients/<client>/analysis/` (audit) and `clients/<client>/rebuild/`
(final sitemap).

> Placeholder — implementation to be added.
