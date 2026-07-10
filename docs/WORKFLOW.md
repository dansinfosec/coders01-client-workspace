# Workflow — From Live Site to Rebuilt Site

This is the end-to-end process for taking a client's existing public website and
rebuilding it in Django + React. Every stage writes into
`clients/<client>/<folder>/`.

---

## Stage 0 — Set up the client

Create the client folders and a brief:

```
clients/<client>/
├─ scraped/
├─ analysis/
├─ assets/
├─ rebuild/
├─ docs/
└─ client.md      # target URL(s), goals, scope, deadlines, contacts
```

`client.md` should answer:
- What is the live URL? What pages/sections are in scope?
- What are the business goals (leads, sales, bookings, info)?
- What must be preserved (branding, content, URLs for SEO)?
- What should improve (SEO, speed, a11y, conversion)?

---

## Stage 1 — Crawl → `scraped/`

Use `automation/crawler`.

- Fetch all in-scope public pages.
- Save raw HTML, extracted plain text, and a URL inventory (`urls.json`).
- Respect `robots.txt` and rate limits (see SCRAPING-POLICY.md).

**Outputs:** `scraped/pages/*.html`, `scraped/text/*.txt`, `scraped/urls.json`

---

## Stage 2 — Assets → `assets/`

Use `automation/image-downloader`.

- Download images, logos, icons, fonts, and media referenced by the pages.
- Preserve original paths/filenames so they can be remapped in the rebuild.

**Outputs:** `assets/images/*`, `assets/fonts/*`, `assets/manifest.json`

---

## Stage 3 — Analyze → `analysis/`

Use `automation/seo-audit` (and manual review).

Produce audits covering:
- **SEO** — titles, meta descriptions, headings, canonicals, schema, sitemap.
- **Performance** — page weight, render-blocking resources, image sizing.
- **Accessibility** — landmarks, alt text, contrast, keyboard nav, ARIA.
- **Content** — page inventory, content types, duplication, gaps.
- **Tech** — current stack, CMS, third-party scripts, forms, integrations.

**Outputs:** `analysis/seo.md`, `analysis/performance.md`,
`analysis/accessibility.md`, `analysis/content-inventory.md`, `analysis/tech.md`

---

## Stage 4 — Document → `docs/`

Use `automation/ai-content-generator` + `prompts/`.

Turn the analysis into a rebuild-ready specification:
- **Sitemap / IA** — the new site structure and URL map (with redirects).
- **Content model** — page types, sections, fields, reusable components.
- **Rebuild spec** — what to build, what to improve, acceptance criteria.

**Outputs:** `docs/sitemap.md`, `docs/content-model.md`, `docs/rebuild-spec.md`

---

## Stage 5 — Rebuild → `rebuild/`

Start from `templates/django-react-starter`, `templates/tailwind-components`,
and `templates/seo`.

- Scaffold the Django backend + React frontend into `rebuild/`.
- Port content from `scraped/` and assets from `assets/`.
- Apply the improvements identified in `analysis/` and `docs/`.
- Preserve important URLs (add redirects) to protect existing SEO.

**Outputs:** a working Django + React project under `rebuild/`.

---

## Definition of Done

- [ ] All in-scope pages rebuilt and content ported.
- [ ] SEO parity or better (titles, meta, schema, sitemap, redirects).
- [ ] Core Web Vitals within target thresholds.
- [ ] Accessibility: no critical WCAG AA violations.
- [ ] Conversion elements (CTAs, forms) present and tested.
- [ ] Rebuild spec acceptance criteria met.
