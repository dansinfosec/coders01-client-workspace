# image-downloader

**Stage 2** tool of the Coders01 workflow. Reads the Stage 1 crawler output for a
client, extracts the **content images** from the saved HTML, filters out UI /
theme junk, de-duplicates them, and downloads them into the client's
`assets/images/` folder — as described in
[../../docs/WORKFLOW.md](../../docs/WORKFLOW.md).

It is **client-agnostic and reusable**: you pass the client (or explicit paths)
on the command line. It never crawls new pages — it works only from what the
crawler already saved in `scraped/`. Respects `robots.txt` and rate limits per
[../../docs/SCRAPING-POLICY.md](../../docs/SCRAPING-POLICY.md).

---

## What it does

1. Loads `scraped/index.json` and reads each saved page in `scraped/pages/`.
2. Extracts image URLs from:
   - `<img src>` and lazy attributes (`data-src`, `data-lazy-src`, `data-original`)
   - `<img srcset>` / `data-srcset` / `data-lazy-srcset`
   - `<picture><source srcset>`
   - Open Graph / social images (`og:image`, `twitter:image`) — toggle with `--no-og`
3. Resolves relative URLs against the page URL; drops fragments (keeps query).
4. **Filters out** (by default): inline `data:` URLs, tracking pixels, favicons,
   `.svg` / `.ico` / `.gif`, unsupported formats, obvious theme/UI assets
   (by name/path patterns), and images below `--min-dimension`.
5. **De-duplicates**, including collapsing WordPress `-WIDTHxHEIGHT` resize
   variants (e.g. `photo-1024x768.jpg`) down to the original `photo.jpg`.
6. Downloads the survivors into `assets/images/` with collision-safe filenames
   (original name preserved; a short hash is added only on a real clash).

> **Note on scope:** `WORKFLOW.md` mentions downloading logos/icons too. By
> default this tool **skips** them (per the tool's requirements). Use
> `--include-ui` and/or `--min-dimension 0` when you actually want them.

## Outputs (in the client's `assets/` folder)

```
assets/
├─ images/                  # downloaded images (real run only)
├─ image-index.json         # per image: source_page, image_url, local_filename,
│                           #   mime_type, file_size, width, height, status, error
└─ download-report.json     # totals: discovered / downloaded / skipped /
                            #   duplicates / errors + skip-reason breakdown
```

In `--dry-run` mode, no images or `images/` folder are written; the index lists
each planned image with `status: "planned"` and the report shows what *would*
happen.

---

## Setup (Windows PowerShell)

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\automation\image-downloader

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

> If activation is blocked: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## CLI

```
python image_downloader.py (--client <name> | --scraped-dir <p> --assets-dir <p>) [options]
```

| Option | Default | Description |
|--------|---------|-------------|
| `--client <name>` | — | Use `clients/<name>/scraped` as input and `clients/<name>/assets` as output. |
| `--scraped-dir <path>` | — | Explicit `scraped/` dir (needs `index.json` + `pages/`). |
| `--assets-dir <path>` | — | Explicit `assets/` output dir. |
| `--dry-run` | off | Discover + plan only. Downloads nothing. |
| `--max-images <n>` | none | Cap on images to download/plan. |
| `--delay <seconds>` | `1.0` | Delay between downloads. |
| `--timeout <seconds>` | `20.0` | Per-request timeout. |
| `--min-dimension <px>` | `100` | Skip images whose known width/height is smaller. `0` keeps all. |
| `--formats <list>` | `jpg,jpeg,png,webp,avif` | Comma-separated allowed extensions. |
| `--include-ui` | off | Keep icons/logos/theme assets (normally filtered). |
| `--include-external` | off | Allow images from other domains (default: same domain). |
| `--keep-resized` | off | Keep WordPress `-WxH` variants instead of collapsing to the original. |
| `--no-og` | off | Ignore Open Graph / social images. |
| `--ignore-robots` | off | Do not respect `robots.txt` (only for sites you own). |
| `--user-agent <ua>` | `Coders01ImageDownloader/1.0` | Custom User-Agent. |
| `--log-level <lvl>` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR`. |

You must provide **either** `--client` **or** both `--scraped-dir` and `--assets-dir`.

### Examples (Windows PowerShell)

```powershell
# Preview what would be downloaded (no network writes to disk)
python image_downloader.py --client hk-vastgoed --dry-run

# Real download, gentle pacing, capped
python image_downloader.py --client hk-vastgoed --max-images 200 --delay 1.0

# Also grab logos/icons and small images
python image_downloader.py --client hk-vastgoed --include-ui --min-dimension 0

# Verbose planning
python image_downloader.py --client hk-vastgoed --dry-run --log-level DEBUG
```

---

## Tests

No network access; nothing is downloaded. Covers URL resolution, srcset parsing,
filtering, collision-safe filenames, de-dup keys, and image-size sniffing.

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\automation\image-downloader
python -m unittest discover -s tests -v
# or: pytest -v
```

---

## Notes & limits

- Works from saved HTML only — images injected purely by JavaScript at runtime
  won't appear unless the crawler captured them.
- Width/height in `--dry-run` come from the HTML (`width`/`height` attributes and
  `srcset` descriptors). On a real download they are re-read from the image bytes
  (PNG/JPEG/GIF/WebP sniffed natively; AVIF falls back to HTML hints).
- Next stage: `automation/seo-audit` consumes `scraped/` + `assets/`.
