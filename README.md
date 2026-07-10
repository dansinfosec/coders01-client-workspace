# Coders01 — Multi-Client Website Workspace

A **reusable workspace** for analyzing, scraping, documenting, and rebuilding
public websites in **Django + React**, with a focus on improving SEO,
performance, accessibility, and conversion.

> This is **not a single website**. It is a working environment that hosts many
> client engagements side by side, plus the shared tools, templates, and prompts
> used across all of them.

---

## Directory Layout

```
coders01-hk-vastgoed-clean/
├─ clients/                     # one folder per client engagement
│  └─ hk-vastgoed/
│     ├─ scraped/               # raw crawled HTML, text, JSON, sitemaps
│     ├─ analysis/              # audits: SEO, performance, a11y, content, tech
│     ├─ assets/                # downloaded images, fonts, logos, media
│     ├─ rebuild/               # the Django + React rebuild of the site
│     └─ docs/                  # generated technical documentation
│
├─ templates/                   # reusable starters shared across clients
│  ├─ django-react-starter/     # base Django + React project skeleton
│  ├─ tailwind-components/       # reusable Tailwind UI components
│  └─ seo/                      # SEO boilerplate (meta, schema, robots, sitemap)
│
├─ automation/                  # reusable scripts & tools
│  ├─ crawler/                  # crawl a site → scraped/
│  ├─ image-downloader/         # pull down images/media → assets/
│  ├─ seo-audit/               # analyze a site → analysis/
│  ├─ sitemap-generator/        # build/normalize sitemaps
│  └─ ai-content-generator/     # AI-assisted copy, meta, alt text
│
├─ prompts/                     # reusable AI prompts for each workflow stage
│
└─ README.md                    # this file
```

---

## The Workflow

Each client moves through five stages. Every stage writes into that client's
folder under `clients/<client-name>/`.

| # | Stage        | Tool(s)                         | Output folder |
|---|--------------|---------------------------------|---------------|
| 1 | **Crawl**    | `automation/crawler`            | `scraped/`    |
| 2 | **Assets**   | `automation/image-downloader`   | `assets/`     |
| 3 | **Analyze**  | `automation/seo-audit`          | `analysis/`   |
| 4 | **Document** | `automation/ai-content-generator`, prompts | `docs/` |
| 5 | **Rebuild**  | `templates/*`                   | `rebuild/`    |

1. **Crawl** — fetch the target site's public pages and store the raw HTML,
   extracted text, and a URL inventory in `scraped/`.
2. **Assets** — download images, logos, fonts, and media into `assets/`.
3. **Analyze** — run SEO / performance / accessibility / content audits and
   save the reports in `analysis/`.
4. **Document** — turn the analysis into human-readable technical docs
   (site map, page inventory, content model, rebuild spec) in `docs/`.
5. **Rebuild** — scaffold a new Django + React implementation in `rebuild/`,
   starting from `templates/django-react-starter` and improving SEO,
   performance, accessibility, and conversion.

See [docs/WORKFLOW.md](docs/WORKFLOW.md) for the detailed step-by-step guide.

---

## Starting a New Client

1. Copy the shape of an existing client folder:
   ```
   clients/<new-client>/{scraped,analysis,assets,rebuild,docs}
   ```
2. Add a `client.md` brief (target URL, goals, constraints, deadlines).
3. Run the workflow stages above, top to bottom.

---

## Conventions

- **Only scrape public content** you are authorized to access. Respect
  `robots.txt`, rate limits, and copyright. See
  [docs/SCRAPING-POLICY.md](docs/SCRAPING-POLICY.md).
- **Never commit secrets** (API keys, `.env` files). Keep them out of git.
- Keep **reusable** logic in `automation/` and `templates/`; keep
  **client-specific** output in `clients/<client>/`.
- One fact/output per file where practical; prefer readable Markdown for docs.

---

## Current Clients

| Client       | Status     | Target |
|--------------|------------|--------|
| hk-vastgoed  | 🟡 set up  | _TBD_  |
