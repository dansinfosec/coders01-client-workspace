# Roofing Center — React MVP

A premium demo website for **Roofing Center**, a **flat-roof specialist** in
**Almere e.o.** (Almere and surrounding areas). Built as a conversion-focused,
lead-generation site with a guided AI-style **Dakassistent** and a quote form.

> **Flat roofs only.** The site advertises bitumen, EPDM, renovation, repair,
> leakage repair, inspection, maintenance and waterproofing of **platte daken**.
> It never advertises pitched roofs, tiles, framing, carpentry, lood-/zinkwerk or
> unconfirmed services. Unknown business details are empty + `// TODO: Confirm
> with client` in `src/data/company.ts` — nothing is fabricated (no fake reviews,
> certifications, guarantees, response times, prices, etc.).

## Tech stack
React 18 · Vite 5 · **strict TypeScript** · Tailwind CSS 3 · React Router 6 ·
React Hook Form · Zod · lucide-react · react-helmet-async. CSS animations only
(no Framer Motion); `prefers-reduced-motion` respected. `sharp` is a **dev-only**
tool used to generate optimized images + logo variants (not shipped to the app).

## Getting started (Windows PowerShell)
```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\roofing-center-react-mvp
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc --noEmit + vite build → dist/
npm run preview      # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run prepare:images   # regenerate optimized images + logo variants (needs source assets)
```

## Routes
`/` · `/diensten` · `/projecten` · `/over-ons` · `/veelgestelde-vragen` ·
`/offerte` · `/contact` · `*` (404). Each has a unique title/description, one
`<h1>`, a shared semantic `<main>`, and a logical heading structure. SPA route
refreshes are handled by `vercel.json` (and `vite preview`).

## Design system (brand)
- **Navy `#0D222D`** — foundation (header, footer, hero band, CTA bands).
- **Green `#45D38E`** — primary buttons, active states, key icons, focus, assistant.
- **Cream `#FEE7AD`** — sparse warm accents (labels, review stars, notes).
Tokens live as CSS variables in `src/index.css`; components use semantic Tailwind
classes (`bg-navy`, `text-green-strong`, `focus-ring`…). Green buttons use dark
navy text (accessible); green **text** on light uses the darker `green-strong`.

## Content architecture (central, no scattered copy)
- `src/data/company.ts` — the single source of truth: name, contact (empty +
  TODO), service area, Google Maps URL, socials, **confirmed** vs **unconfirmed**
  services, CTA text, hours, legal.
- `src/data/services.ts`, `projects.ts`, `process.ts`, `faqs.ts`, `navigation.ts`.

## Images
- Source of truth: `clients/roofing-center/assets/` (**never modified**).
- Optimized copies (WebP + JPEG, explicit dimensions, lazy-loading, hero
  prioritized): `public/images/roofing-center/{optimized,services,projects}/`.
- Logo: original preserved in `original-logo/`; transparent white/navy variants +
  favicons **derived programmatically** (luminance key, no AI) in `generated-logo/`.
- Regenerate with `npm run prepare:images` (see `scripts/optimize-images.mjs`).

## AI assistant (Dakassistent)
Frontend-only guided lead flow — see `AI_ASSISTANT_ARCHITECTURE.md`. It does not
claim a live AI backend, never diagnoses with certainty, saves a sessionStorage
draft, lets visitors review/edit answers, and confirms honestly ("demo — niets
verzonden"). Leads flow through a `LeadSubmissionAdapter` (`LocalDemoAdapter` now;
Django/n8n/email/CRM/WhatsApp later). **The browser never calls an LLM; no keys
in the frontend.**

## Lead capture
- **Quote form** (`/offerte`): React Hook Form + Zod, accessible labels/errors,
  photo-upload UI (metadata only), honeypot, privacy consent, demo success state.
- **Dakassistent**: guided conversation → summary → demo submission.
- Floating actions (assistant + WhatsApp when configured) never overlap and
  respect the mobile safe area.

## Not included in this phase
No backend, CMS, database or auth. No real email/CRM/LLM calls. See
`AI_ASSISTANT_ARCHITECTURE.md` and `ASSET_ANALYSIS.md` for the full picture.
