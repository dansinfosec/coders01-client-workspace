# crawler

**Stage 1** tool. Crawls a target site's public pages and writes raw output to
`clients/<client>/scraped/`.

Responsibilities:
- Discover URLs (from sitemap + link following) within the allowed scope.
- Fetch each page; save raw HTML (`pages/`) and extracted text (`text/`).
- Record a URL inventory with status codes (`urls.json`).
- Respect `robots.txt`, rate limits, and caching (see
  [Scraping Policy](../../docs/SCRAPING-POLICY.md)).

> Placeholder — implementation to be added.
