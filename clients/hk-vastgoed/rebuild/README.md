# HK Vastgoed & Onderhoud — website MVP

A modern, responsive **React + Vite** frontend for HK Vastgoed & Onderhoud, built
as a **static demo for client approval**. It reuses the factual content and
imagery from the client's existing website (crawled in Stage 1–2 of this
workspace) and presents it in a cleaner, more conversion-focused structure.

> **Scope of this MVP:** frontend only. There is **no** Django backend, API,
> database, authentication, CMS or email integration yet. The contact and
> quotation forms validate input and show a success state, but **do not send data
> anywhere** — backend integration is pending (see [Forms](#forms)).

---

## Tech stack

- **React 18** + **Vite 5**
- **React Router 6** (client-side routing)
- **Tailwind CSS 3** (styling)
- All content lives in **`src/data/`** as plain JS modules, so it can later be
  swapped for a Django API or CMS without touching the components.

## Project structure

```
rebuild/
├─ public/
│  ├─ images/            # curated client photos (from ../assets/images)
│  ├─ favicon.svg
│  └─ robots.txt
├─ src/
│  ├─ data/              # ← all content (verified facts + marked placeholders)
│  │  ├─ company.js
│  │  ├─ services.js
│  │  ├─ process.js
│  │  ├─ projects.js
│  │  ├─ testimonials.js # PLACEHOLDER reviews (clearly marked)
│  │  └─ faqs.js
│  ├─ components/        # reusable UI (Navbar, Footer, Hero, LeadForm, …)
│  ├─ pages/             # one file per route
│  ├─ App.jsx            # routes
│  ├─ main.jsx           # entry
│  └─ index.css          # Tailwind + base styles
├─ index.html
├─ tailwind.config.js
├─ vite.config.js
├─ vercel.json           # SPA rewrites so deep links work on Vercel
└─ package.json
```

## Routes

| Path | Page |
|------|------|
| `/` | Homepage |
| `/diensten` | Diensten overview |
| `/diensten/:slug` | Individual service page (12 services) |
| `/projecten` | Projecten |
| `/over-ons` | Over ons |
| `/contact` | Contact |
| `/offerte` | Offerte aanvragen |
| `/privacybeleid` | Privacybeleid |
| `/algemene-voorwaarden` | Algemene voorwaarden |
| `*` | Custom 404 |

---

## Local setup (Windows PowerShell)

Requires **Node.js 18+** and npm.

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\hk-vastgoed\rebuild

# 1. Install dependencies
npm install

# 2. Start the dev server (hot reload) — usually http://localhost:5173
npm run dev
```

### Build & preview a production bundle

```powershell
npm run build       # outputs to dist/
npm run preview     # serves the built dist/ locally to verify
```

### Lint

```powershell
npm run lint
```

---

## Deploying to Vercel

This is a static SPA — no server needed. `vercel.json` already contains the
rewrite that makes client-side routes (e.g. `/diensten/daklekkage`) work on
refresh/deep-link.

### Option A — Vercel dashboard (Git)

1. Push this workspace to a Git provider (GitHub/GitLab/Bitbucket).
2. In Vercel, **Add New → Project** and import the repository.
3. Set **Root Directory** to `clients/hk-vastgoed/rebuild`.
4. Vercel auto-detects Vite. Confirm:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
5. **Deploy.** You'll get a shareable `*.vercel.app` preview URL for the client.

### Option B — Vercel CLI

```powershell
npm i -g vercel
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\hk-vastgoed\rebuild
vercel            # first run: follow prompts, accept Vite defaults
vercel --prod     # promote to a production URL
```

No environment variables are required for this MVP, so there is no `.env.example`.
When a backend is added, introduce a `VITE_API_URL` (see below) and add
`.env.example` then.

---

## Forms

The **Contact** and **Offerte** forms share `src/components/LeadForm.jsx`. They:

- validate required fields (name, e-mail, phone, message; quotation also requires
  a service) and a valid e-mail format;
- show a clear success state on submit;
- **do not transmit any data** — nothing is sent to a server.

> ⚠️ **Backend integration pending.** `LeadForm.jsx` contains a marked spot where
> a real `POST` (e.g. to a Django endpoint via `VITE_API_URL`, or a form service)
> should be wired up before launch. Until then, no user data leaves the browser.
> The success message is intentionally written as a normal confirmation — the
> public-facing UI is **not** labelled as a demo.

---

## Content & data notes

- **Verified content** (contact details, three vestigingen, services, working
  process, FAQ, "over ons" story, certificates) is taken from the client's own
  crawled website and marked `VERIFIED` in `src/data/`.
- **Placeholder content** is clearly marked:
  - `src/data/testimonials.js` — the site had a reviews section but **no verified
    review text**, so these are demo testimonials (`isPlaceholder: true`) and the
    UI shows a visible "voorbeeld" notice.
  - KvK/BTW numbers are marked as pending/unverified. No social profiles were
    found in the crawl.
  - **WhatsApp is enabled** (`https://wa.me/31850600397`): the client's existing
    site has a configured WhatsApp chat widget on every page, so it is a real
    channel — not inferred from the phone number. The original link was missing
    the country code and has been corrected. Phone links use the international
    format `tel:+31850600397`.
- **Images** are a curated subset of the client's own downloaded photos
  (`../assets/images`), copied into `public/images/` with clean names. Low-value
  UI icons, logos and duplicate resize variants were excluded.
- Copy has been rewritten for clarity and conversion but **no claims were
  invented** — certifications, the "25+ jaar" experience line, and service
  descriptions all come from the existing site.

See `../docs/` (workspace docs) and the source-data comments for the full
verified-vs-placeholder breakdown.
