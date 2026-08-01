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

## Batch: category × location matrix

`batch` runs many categories × locations in one resumable pass, reusing the same
Places client, pagination, budget, dedup, storage and (optionally) audit. The
category and location lists live in **`leadfinder/targets.py`** — edit them there.

```powershell
# Preview only — combinations + generated queries + USD estimate, ZERO API calls
python lead_finder.py batch --dry-run
python lead_finder.py batch --dry-run --exclude Dakdekker --round-robin
python lead_finder.py batch --estimate-cost --category-limit 5

# Mock (no real API) — subset selection
python lead_finder.py --mock batch --category Kapper --category Schilder --location Utrecht --location Haarlem
python lead_finder.py --mock batch --category-limit 3 --location-limit 5 --max-results 10

# Live, USD-budgeted broad sweep — >20 combinations require --yes; resume is automatic
python lead_finder.py batch --exclude Dakdekker --round-robin --require-phone `
    --max-results 5 --usd-budget 230 --safety-pct 15 --budget 8000 --yes
python lead_finder.py batch --reset-state        # clear checkpoint + USD cost state

# Auditing stays opt-in (no Places cost) — run it later on new leads
python lead_finder.py --mock batch --category Dakdekker --location Amsterdam --audit
```

- **USD cost guard (`leadfinder/pricing.py`).** Every billable request — each
  Text Search page ($0.032, *Text Search Pro*), each Place Details ($0.025,
  *Enterprise + Atmosphere*, because the mask carries rating/reviews), **and each
  retry** — is *reserved and recorded before it is sent*, inside the client
  request path. The run **stops at the operational ceiling**
  (`--usd-budget` minus `--safety-pct`, default $230 − 15% = **$195.50**) and can
  never cross the **absolute** ceiling ($230). Spend is persisted to
  `output/cost-state.json` on every reservation and is **cumulative across
  resumed runs**, so a crash or resume can never reuse the budget.
- **Round-robin (`--round-robin`).** Spreads requests diagonally across
  categories *and* locations so budget isn't consumed by one category or city.
- **Phone-required (`--require-phone`).** Only businesses with a valid phone are
  saved; Place Details fetched for phoneless businesses are counted as
  `skipped (no valid phone)` in the report.
- **Resumable checkpoints** (`output/batch-progress.json`, saved after every
  combination) record per-combo: requests used, est. USD, businesses found,
  leads kept/new/updated, skipped-no-phone, duplicates, timestamp. A re-run
  **skips completed** combos; **failed** combos (category, location, error, retry
  count, timestamp) are retried; a combo cut short by the ceiling stays pending.
- **Merging:** new results merge into each category's `industries/<slug>/` folder
  (existing leads preserved). Dedup order: place_id → domain → phone → name+city.
- **Large-batch guard:** batches over 20 combinations require `--yes`.
- Each category writes to its own industry folder; `Dakdekker`/`Makelaar` alias
  to the existing `dakdekkers`/`makelaars` folders so results merge in.

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
