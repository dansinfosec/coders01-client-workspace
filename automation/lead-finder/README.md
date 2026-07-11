# lead-finder

A reusable **Google Places API (New)** lead finder for the Coders01 workspace.
It finds businesses by industry + region, collects their **public** contact
details, audits their websites, and ranks the strongest **website-redesign
opportunities** with an explainable 0–100 score.

> **Official API only.** This tool never scrapes `maps.google.com` HTML. It uses
> the Places API (New) Text Search + Place Details endpoints with field masks.
> See [../../docs/SCRAPING-POLICY.md](../../docs/SCRAPING-POLICY.md).

> **Safe by default in development.** Every command supports `--mock`, which uses
> bundled fixtures and makes **no real API calls**. All tests are mocked.

---

## What it does (pipeline)

```
search   →  leads.json / leads.csv         (Places API: Text Search + Place Details)
audit    →  website-audits.json + scores   (fetch each site, extract facts)
export   →  leads-export.csv/json          (filter by --min-score)
dashboard→  dashboard.html                 (local review UI)
```

## Architecture

```
automation/lead-finder/
├─ lead_finder.py            # CLI: search | audit | export | dashboard
├─ leadfinder/               # package
│  ├─ config.py              # .env loading, output paths, request Budget
│  ├─ logging_setup.py       # structured logging
│  ├─ places_client.py       # Places API client + Real/Mock transports, retries,
│  │                         #   pagination, field masks, request counters
│  ├─ leads.py               # map Places payloads → flat lead schema
│  ├─ normalize.py           # domain/phone normalization + de-duplication
│  ├─ audit.py               # website audit (Real/Mock fetcher) → findings
│  ├─ scoring.py             # explainable 0–100 opportunity score
│  ├─ screenshots.py         # optional desktop/mobile capture (Playwright)
│  ├─ storage.py             # JSON/CSV/report I/O, CSV assembly, review state
│  ├─ dashboard.py           # self-contained HTML review dashboard
│  └─ mockdata.py            # synthetic Places responses + mock websites
├─ tests/                    # mocked API + normalization/dedup/scoring tests
├─ output/                   # generated (gitignored)
├─ requirements.txt
├─ .env.example
└─ .env                      # your key (gitignored — never committed)
```

**Transports/fetchers are swappable.** `RealTransport`/`RealFetcher` hit the
network; `MockTransport`/`MockFetcher` return fixtures. `--mock` selects the
mock everywhere, so the whole pipeline — and every test — runs offline.

---

## Places API field masks

Requests send `X-Goog-FieldMask` so we fetch (and pay for) only what we need. We
deliberately do **not** request photos, reviews, ratings or opening hours.

**Text Search** (`POST /v1/places:searchText`):
```
places.id, places.displayName, places.formattedAddress, places.location,
places.primaryType, places.googleMapsUri, places.businessStatus, nextPageToken
```

**Place Details** (`GET /v1/places/{id}`), only when contact info is needed:
```
id, displayName, formattedAddress, nationalPhoneNumber, internationalPhoneNumber,
websiteUri, googleMapsUri, businessStatus, primaryType
```

---

## Data collected & de-duplication

Per lead: `place_id, business_name, category, address, city, region, phone,
website, google_maps_uri, business_status, source_checked_at`.

Leads are de-duplicated on three keys (priority order): **place_id → normalized
domain → normalized phone**. Domains drop scheme/`www`/path; phones normalize to
E.164 (`085 - 060 0397` → `+31850600397`).

---

## Opportunity score (0–100, explainable)

Each rule that fires adds points and records a reason; the total is capped at 100.

| Rule | Points |
|------|--------|
| No website | **100** (dominates) |
| Website unreachable (DNS/timeout/SSL/refused) | +40 |
| Repeated server error (5xx) | +30 |
| No HTTPS | +15 |
| No mobile viewport | +15 |
| Response time > 5s | +15 |
| No contact/quotation form | +10 |
| No clear CTA | +10 |
| Broken links or images | +10 |
| Outdated copyright year | +5 |
| Missing title or contact info | +5 |

"No website" short-circuits to 100. "Unreachable" short-circuits after adding
unreachable (+ server error). Every reason is saved in `website-audits.json`,
the CSV `top_problems` column, and the dashboard.

---

## Setup (Windows PowerShell)

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\automation\lead-finder

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Configure your key (never commit .env)
Copy-Item .env.example .env
notepad .env      # set GOOGLE_MAPS_API_KEY=...
```

Enable **Places API (New)** for the key in Google Cloud Console.

### Run the mock demo (no API calls, no key needed)

```powershell
python lead_finder.py --mock search --query "dakdekker" --region "Utrecht" --max-results 50
python lead_finder.py --mock audit
python lead_finder.py export --min-score 60 --format csv
python lead_finder.py dashboard
# then open output\dashboard.html in a browser
```

### Real usage (makes billable API calls — omit --mock)

```powershell
python lead_finder.py search --query "kapper" --region "Amsterdam" --max-results 100 --budget 300
python lead_finder.py audit
python lead_finder.py export --min-score 60
```

Useful flags: `--dry-run` (print the planned request, call nothing),
`--resume` (continue search from the saved page token / skip audited leads),
`--budget N` (cap billable requests), `--lat/--lng/--radius` (location bias),
`--screenshots` (needs Playwright), `--output-dir <path>`.

---

## Tests

Fully mocked — no network:

```powershell
python -m unittest discover -s tests -v
```

Covers normalization, de-duplication, scoring (incl. the 100 cap), and the
Places client (pagination, field masks, request counters, budget stop).

---

## Review dashboard

`dashboard` builds `output/dashboard.html` — a single self-contained page (no
server, no dependencies). You can sort by score, filter by industry/city/region/
status, view desktop/mobile screenshots, mark leads **approved/rejected**, add
notes, and export approved leads to CSV. Review state is saved in your browser's
localStorage; use **Export review-state.json** and drop it in `output/` so
`export` reflects your decisions in the `review_status`/`notes` columns.

---

## Guardrails (by design)

- Official Places API only — no Maps HTML scraping, no proxies, no rate-limit
  evasion.
- The API key is read only from env/`.env`; never hardcoded, logged or exported.
- The tool **never** calls, emails or messages businesses — it only reads public
  data and produces a review list for a human.
- During development it makes **no real API calls** (`--mock` + mocked tests).
