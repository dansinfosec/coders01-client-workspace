# scraped-data/

Landing area for the **existing workspace scrapers** when run against
`https://semenco.nl/`. Nothing here is created by hand — it is produced by the
shared tools in `automation/` (see the project root `README.md` → "Scraper").

> This project does **not** contain its own scraper. It reuses:
> - `automation/crawler/crawler.py` (Stage 1 — HTML crawl)
> - `automation/image-downloader/image_downloader.py` (Stage 2 — images)

## Folder layout (actual tool output)

When the crawler is pointed at this folder with `--output-dir scraped-data`, and
the image-downloader with `--scraped-dir scraped-data --assets-dir scraped-data/assets`:

```
scraped-data/
├─ index.json          # crawler: per-page metadata index
├─ crawl-report.json   # crawler: crawl summary
├─ pages/*.html        # crawler: one raw HTML file per page
├─ assets/
│  ├─ images/*         # image-downloader: downloaded content images
│  ├─ image-index.json # image-downloader: per-image metadata
│  └─ download-report.json
└─ reports/            # your manual review notes (see below)
```

## What goes where

| File | Produced by | Description |
|------|-------------|-------------|
| `pages/*.html` | crawler | One raw HTML file per crawled page. |
| `index.json` | crawler | Per-page url, title, status, meta description, canonical, filename. |
| `crawl-report.json` | crawler | Crawl summary: successful / skipped / errors + settings. |
| `assets/images/*` | image-downloader | Downloaded content images. |
| `assets/image-index.json` | image-downloader | Per image: source page, url, local filename, size, status. |
| `assets/download-report.json` | image-downloader | Totals + skip-reason breakdown. |
| `reports/content-review-notes.md` | you | Manual notes while reviewing scraped copy (accuracy, tone, what to keep). |

## Review workflow

1. Run the crawler (see root `README.md`) → `pages/` + `reports/crawl-report.json`.
2. Review the copy; capture decisions in `reports/content-review-notes.md`.
3. Run the image-downloader → `assets/`.
4. Move **approved** images into `../public/images/semenco/` for use in the app.
5. Replace the placeholder content in `src/data/*` with verified text.

Raw HTML and downloaded binaries are gitignored (see `../.gitignore`); the folder
structure is kept via `.gitkeep` files.
