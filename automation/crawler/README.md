# crawler

**Stage 1** tool of the Coders01 workflow. Crawls the publicly accessible pages
of a single site and saves the raw output into a client's `scraped/` folder, as
described in [../../docs/WORKFLOW.md](../../docs/WORKFLOW.md).

It is **client-agnostic and reusable** — you pass the target URL and the client
(or an explicit output directory) on the command line.

> Only crawl sites you are authorized to crawl. This tool respects `robots.txt`
> and rate limits by default — see [../../docs/SCRAPING-POLICY.md](../../docs/SCRAPING-POLICY.md).
> It does **not** download images or media; that is the job of the separate
> `automation/image-downloader` tool.

---

## What it does

- Starts from one URL and follows links **on the same domain** (subdomains
  optional).
- **Respects `robots.txt`** (can be disabled only for sites you own).
- Adds a **configurable delay** between requests.
- **De-duplicates** URLs and guards against infinite loops (a `seen` set +
  normalized URLs).
- Stops after a **configurable maximum number of pages**.
- Skips non-HTML resources (images, PDFs, CSS/JS, archives, …).
- Has timeouts, error handling, and logging.

## Outputs (written to the client's `scraped/` folder)

```
scraped/
├─ pages/                 # raw HTML, one file per page
│  ├─ index-1a2b3c4d5e.html
│  └─ about_team-6f7a8b9c0d.html
├─ index.json             # per-page: url, title, status_code,
│                         #           meta_description, canonical_url, filename
└─ crawl-report.json      # successful / skipped / errors + run settings
```

---

## Setup (Windows PowerShell)

From the crawler folder:

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\automation\crawler

# Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

> If activation is blocked by execution policy, run once (current user):
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## Usage

```
python crawler.py <url> (--client <name> | --output-dir <path>) [options]
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--client <name>` | — | Save to `clients/<name>/scraped/` (relative to workspace root). |
| `--output-dir <path>` | — | Explicit output directory (overrides `--client`). |
| `--max-pages <n>` | `50` | Maximum number of pages to crawl. |
| `--delay <seconds>` | `1.0` | Delay between requests (politeness). |
| `--timeout <seconds>` | `15.0` | Per-request timeout. |
| `--include-subdomains` | off | Also crawl subdomains of the start host. |
| `--ignore-robots` | off | Skip `robots.txt` (only for sites you own/are authorized to crawl). |
| `--user-agent <ua>` | `Coders01Crawler/1.0` | Custom User-Agent header. |
| `--log-level <level>` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR`. |

You must provide **either** `--client` **or** `--output-dir`.

### Examples (Windows PowerShell)

```powershell
# Crawl into clients/hk-vastgoed/scraped/ (default 50 pages, 1s delay)
python crawler.py https://example.com --client hk-vastgoed

# More pages, a gentler delay, include subdomains
python crawler.py https://example.com --client hk-vastgoed `
    --max-pages 200 --delay 1.5 --include-subdomains

# Explicit output directory instead of --client
python crawler.py https://example.com `
    --output-dir ..\..\clients\hk-vastgoed\scraped --max-pages 100

# Verbose logging
python crawler.py https://example.com --client hk-vastgoed --log-level DEBUG
```

Backtick (`` ` ``) is the PowerShell line-continuation character.

---

## Tests

No network access is required; the tests cover URL normalization, same-domain
filtering, and filename generation.

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\automation\crawler

# With the standard library
python -m unittest discover -s tests -v

# …or with pytest, if installed
pytest -v
```

---

## Notes & limits

- Static HTML only — it does not execute JavaScript, so client-side-rendered
  content may be missing. (A headless-browser mode can be added later.)
- Query strings are treated as distinct pages; adjust `normalize_url` if a site
  uses tracking parameters that should be ignored.
- Next stage: run `automation/image-downloader` against the same client to
  pull down the assets referenced by these pages.
