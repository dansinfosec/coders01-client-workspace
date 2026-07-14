# Sem & Co — React MVP scaffold

A clean, professional, scalable **frontend foundation** for the redesign of
[semenco.nl](https://semenco.nl/). Sem & Co provides small-scale, personal and
home-like care and overnight accommodation for children and young people who
need extra support.

> **Phase 1 = scaffold only.** This is the foundation to build on — not the
> finished website. All care/contact copy is clearly-marked **placeholder** text
> (`Content to be replaced after scrape`) and must be verified with the client
> before launch. There is **no backend, CMS or database** in this phase.

The visual system is a temporary, neutral palette designed to feel **warm, safe,
calm, personal, trustworthy and accessible** — home-like without being childish,
care-focused without being clinical. Final colours/imagery come after the logo
and scraped assets are analysed.

---

## Technology stack

| Concern | Choice |
|---|---|
| Build tool | Vite 5 |
| UI library | React 18 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 (semantic design tokens via CSS variables) |
| Routing | React Router 6 |
| Icons | lucide-react |
| Forms | React Hook Form + Zod + @hookform/resolvers |
| Document head / SEO | react-helmet-async |

Deliberately **not** used: Next.js, Django, Express, Sanity, WordPress,
Firebase, Supabase, any database, auth, server actions or API routes. No Framer
Motion (subtle transitions use CSS + `prefers-reduced-motion`).

---

## Folder structure

```
semenco-react-mvp/
├─ public/
│  └─ images/semenco/        # approved imagery for the app (added after review)
├─ scraped-data/             # output of the shared workspace scrapers (see below)
│  ├─ pages/  assets/  reports/
├─ src/
│  ├─ assets/                # local static assets imported by code
│  ├─ components/
│  │  ├─ forms/              # ApplicationForm (multistep) + shared field inputs
│  │  ├─ layout/             # SiteHeader, navigation, SiteFooter, RootLayout, PageContainer
│  │  ├─ sections/           # PageHero, Section, SectionHeading, CallToAction, templates
│  │  └─ ui/                 # Button, Card, Breadcrumbs
│  │  └─ SEO, ErrorBoundary, ScrollToTop
│  ├─ data/                  # ← editable website content (typed)
│  ├─ hooks/                 # useLockBodyScroll
│  ├─ lib/                   # (reserved for future shared libs)
│  ├─ pages/                 # one component per route
│  ├─ routes/                # paths.ts + AppRoutes.tsx
│  ├─ types/                 # content + blog types
│  ├─ utils/                 # cn, formatDate, readingTime
│  ├─ App.tsx  main.tsx  index.css
├─ README.md  TODO.md
```

---

## Getting started (Windows PowerShell)

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\semenco-react-mvp

npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check (tsc --noEmit) + production build → dist/
npm run preview    # serve the production build locally
npm run typecheck  # type-check only
npm run lint       # eslint
```

Requires Node 18+ (developed on Node 24).

---

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Hero, services, highlights, CTA |
| `/over-ons` | Over ons | (legacy `/over-sem-en-co` → 301-style client redirect here) |
| `/logeeropvang` | Logeeropvang | Service page (shared template) |
| `/vakantieopvang` | Vakantieopvang | Service page (shared template) |
| `/crisisopvang` | Crisisopvang | Service page (shared template) |
| `/werkwijze` | Werkwijze | Process steps + FAQ |
| `/aanmelden` | Aanmelden | **Multistep application form** |
| `/blog` | Blog overview | 3 clearly-labelled example posts |
| `/blog/:slug` | Blog detail | Falls back to 404 for unknown slugs |
| `/contact` | Contact | Unverified placeholder details |
| `*` | 404 | `noindex` |

Every page renders a single `<h1>`, its own `<title>`/meta description (via the
`SEO` component), and shares one semantic `<main>` from `RootLayout`.

**Client-side routing on static hosts:** `vercel.json` rewrites all paths to
`index.html` so deep links / refreshes work. `vite preview` does the same SPA
fallback locally. For other hosts (Netlify etc.) add an equivalent rewrite.

---

## Where editable content lives

All website copy is centralised in typed files under **`src/data/`** — not
scattered through JSX:

| File | Content |
|---|---|
| `siteSettings.ts` | Brand name, verified tagline, source URL, locale, `siteIntro` |
| `navigation.ts` | Header / footer / mobile menu links + primary CTA |
| `homeContent.ts` | Home hero, intro, highlights, "voor wie", location, closing CTA |
| `aboutContent.ts` | "Over ons" intro / approach / small-scale + a to-confirm note |
| `careServices.ts` | The three verified services + `crisisFundingRoutes` (Jeugdwet/WLZ) |
| `processSteps.ts` | Verified 6-step intake process |
| `faqs.ts` | FAQs (`publishedFaqs` = only the verified ones shown publicly) |
| `blogPosts.ts` | Example blog posts + `getPublishedPosts` / `getPostBySlug` |
| `contactDetails.ts` | Contact block (verified address; phone/email `null` = hidden) |
| `applicationFormContent.ts` | Intro screen, notices, confirmation copy for the form |
| `imageAssets.ts` | Central image registry (path, alt, dimensions, source URL) |

Each has matching types in `src/types/`. Editing content means editing data, not
components.

## Where scraped data & images live

- **Scraped pages / crawl reports / image metadata:** `scraped-data/`
  (see `scraped-data/README.md`).
- **Approved images used by the app:** `public/images/semenco/`
  (referenced as `/images/semenco/...`). Move images here from
  `scraped-data/assets/images/` only after review.

---

## Multistep application form

Location: `src/components/forms/ApplicationForm/`. Frontend-only, built on React
Hook Form + Zod.

```
ApplicationForm/
├─ ApplicationForm.tsx          # orchestrator: intro → steps → success
├─ ApplicationFormProvider.tsx  # single RHF form + step context + sessionStorage draft
├─ ApplicationIntro.tsx         # entry screen ("Start de aanvraag")
├─ ApplicationProgress.tsx      # progress (mobile: number+title+bar; desktop: step list)
├─ ApplicationErrorSummary.tsx  # focus-grabbing error summary on failed "next"
├─ ApplicationNavigation.tsx    # Previous / Next / Submit + "Wis formulier"
├─ ApplicationSummary.tsx       # grouped review with per-step "edit" links
├─ applicationFormSchema.ts     # Zod schema (conditionals) + types + defaults
├─ applicationFormTypes.ts      # RequestType, ApplicantType, StepId, StepDefinition
├─ applicationFormConfig.ts     # step list, request-type + applicant cards, option tables
└─ steps/                       # RequestType, Applicant, Contact, ChildDetails,
                                #   SupportNeeds, CareDetails, Preferences, Review
```

- **Intro screen** first (what it's for, 8 steps, no guaranteed placement).
- **8 steps:** type of request (cards + calm crisis notice) → who fills it in
  (conditional: parent → relation; professional → organisation + role) → contact →
  child (minimal, no BSN/passport/insurance) → support (selectable cards + text) →
  care & referral (neutral funding wording) → preferences (crisis-conditional) →
  review + two consents.
- **Per-step validation** (`trigger` on the step's fields) before advancing.
- **State is retained** across steps (`shouldUnregister: false`) and **persisted
  to `sessionStorage`** so an accidental refresh restores progress. "Wis formulier"
  clears it (with confirm); the draft is removed after a successful demo submit.
- Accessible: labelled inputs, `aria-describedby`, `role="alert"` errors, error
  summary that receives focus, focus moved to the first invalid field and to the
  step heading on step change.
- **No network request.** The submit handler is marked
  `// TODO: Replace demo submission with backend API integration.` and shows a
  calm confirmation screen (not an alert). Medical detail is intentionally minimal.

---

## Connecting a backend later

The form does not talk to any server yet. To connect one:

1. Replace the demo submit in `ApplicationForm.tsx` (the `onSubmit` marked with
   the TODO) with a `fetch`/client call to your endpoint, sending the validated
   `ApplicationFormValues`.
2. Keep the Zod schema as the shared contract; validate again server-side.
3. Add loading/error states around the existing `submitting`/`success` states.

No other component needs to change — the form is self-contained.

## Replacing local data with a CMS later

The UI reads content only through `src/data/*` and their types. To move to a CMS:

1. Keep the types in `src/types/` as the contract.
2. Swap the static exports for data fetched from the CMS (e.g. map the CMS
   response to `BlogPost[]` / `Service[]` in the same files, or behind the same
   `getPublishedPosts()` / `getPostBySlug()` helpers).
3. Components stay unchanged because they depend on the types, not the source.

---

## Scraper (reuses the shared workspace tools — no new scraper)

This project does **not** contain its own scraper. It reuses the existing
workspace tools and writes their output into `scraped-data/`.

**Stage 1 — crawl** (`automation/crawler/`, respects `robots.txt`, on-domain,
HTML only, no images):

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\automation\crawler
.\.venv\Scripts\Activate.ps1   # first time: python -m venv .venv; pip install -r requirements.txt
python crawler.py https://semenco.nl/ `
    --output-dir ..\..\clients\semenco-react-mvp\scraped-data `
    --max-pages 30 --delay 1.5
```

Writes `scraped-data/pages/*.html`, `scraped-data/index.json`,
`scraped-data/crawl-report.json`.

**Stage 2 — images** (`automation/image-downloader/`, works only from the saved
HTML; start with `--dry-run`):

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\automation\image-downloader
.\.venv\Scripts\Activate.ps1
python image_downloader.py `
    --scraped-dir ..\..\clients\semenco-react-mvp\scraped-data `
    --assets-dir  ..\..\clients\semenco-react-mvp\scraped-data\assets `
    --dry-run
```

Remove `--dry-run` to download. Then review, and move approved images into
`public/images/semenco/`.

> A limited **inspection crawl** (a handful of public pages) was run during
> scaffolding to confirm the tool works against this domain — see
> `scraped-data/reports/crawl-report.json`.
