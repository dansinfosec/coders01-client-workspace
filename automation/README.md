# automation/

Reusable scripts and tools used across all clients. Each tool reads a target and
writes into the relevant `clients/<client>/` subfolder.

| Tool                    | Stage | Writes to     | Purpose |
|-------------------------|-------|---------------|---------|
| `crawler`               | 1     | `scraped/`    | Crawl public pages, save HTML/text + URL inventory |
| `image-downloader`      | 2     | `assets/`     | Download images/fonts/media referenced by pages |
| `seo-audit`             | 3     | `analysis/`   | Audit SEO / performance / a11y / content / tech |
| `sitemap-generator`     | 3–4   | `analysis/`, `rebuild/` | Build/normalize sitemaps + URL maps |
| `ai-content-generator`  | 4     | `docs/`       | AI-assisted copy, meta descriptions, alt text |

Guidelines:
- Tools must be **client-agnostic** — take the client/target as input.
- Follow the [Scraping Policy](../docs/SCRAPING-POLICY.md).
- Keep config out of code; never hardcode secrets.
