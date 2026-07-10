# image-downloader

**Stage 2** tool. Downloads images, fonts, and media referenced by scraped pages
into `clients/<client>/assets/`.

Responsibilities:
- Parse asset URLs from scraped HTML/CSS.
- Download into `assets/images/`, `assets/fonts/`, `assets/media/`.
- Write `assets/manifest.json` mapping original URL → local path.
- Skip already-downloaded assets; respect rate limits.

> Placeholder — implementation to be added.
