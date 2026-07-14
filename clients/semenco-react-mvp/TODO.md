# TODO — Sem & Co React MVP

The MVP now uses **verified content and imagery** from the live site. Remaining
items are mostly **client confirmations** (things we must not invent) and future
technical work. See `scraped-data/reports/content-inventory.md`.

## Needs client confirmation (do not publish until confirmed)
- [ ] **Phone number and e-mail** — the live `/contact` page is bot-protected, so
      these are `null` in `contactDetails.ts` and hidden. Add once confirmed.
- [ ] **Team information** (names, roles, qualifications) — none shown; add after
      confirmation. `aboutContent.toConfirmNote` explains the gap on `/over-ons`.
- [ ] **Funding eligibility & referral procedure** beyond the named routes
      (Jeugdwet / WLZ). The `vergoeding` FAQ is kept internal (`verified: false`).
- [ ] **Partner/quality logos** (BPSW, Inspectie, Klachtenportaal, Spoor030) are
      downloaded and in `imageAssets.ts` but **not shown** yet — confirm meaning
      and usage rights before displaying any trust marks.
- [ ] Unique copy for `/voor-wie`, `/ouders`, `/info` (JS-rendered on the live
      site, not captured) and exact vakantieweek availability.
- [ ] Confirm the final URL/IA map (live site uses `/logeren`, `/aanpak`,
      `/voor-wie`, `/ouders`, `/info`; the MVP keeps redesign routes + a
      `/over-sem-en-co → /over-ons` redirect).

## Content (done ✓ / remaining)
- [x] Migrate verified home, service, process, about, crisis funding content.
- [x] Verify care terminology (logeer-/vakantie-/crisisopvang, WLZ/Jeugdwet).
- [ ] Final editorial pass on all copy with the client.
- [ ] Replace the example blog articles (still clearly labelled "Voorbeeldartikel").

## Design
- [x] Warm, calm token system informed by the logo/forest imagery.
- [x] Homepage, service pages, about, werkwijze, contact built with real content.
- [ ] Add more approved photography (accommodation, activities, team, location) —
      only the logo + one atmosphere photo are available so far. No stock photos.
- [ ] Optimise/resize the hero photo (currently 1089², ~880 KB; no image tooling
      was added to avoid quality loss / extra deps).
- [ ] Finalise the logo usage in the header (currently wordmark text).

## Application form
- [x] 8-step flow, intro screen, conditional applicant type, sessionStorage draft,
      error summary, focus management, calm success state.
- [ ] Confirm the exact required questions and crisis flow with the client.
- [ ] Add backend submission (replace the demo `onSubmit`).
- [ ] Add email notification, spam protection, and a privacy retention policy.
- [ ] Add a real privacy statement page + link (placeholder note shown for now).
- [ ] Add secure file upload only if later required.

## Blog
- [ ] Replace example articles; add CMS, category filtering, search, share metadata.

## Technical
- [ ] Connect a backend; add a CMS to replace `src/data/*` (types are the contract).
- [ ] Add analytics, cookie consent, monitoring (wire into `ErrorBoundary`).
- [ ] Add production deployment (SPA rewrite already in `vercel.json`).
- [ ] Add automated tests (schema/utils unit tests, form-flow component tests).
