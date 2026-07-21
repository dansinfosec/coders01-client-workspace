# All-in Daktechniek — React MVP (rebuild)

Demo-rebuild van de website van All-in Daktechniek. Fase 1: frontend-only,
geen backend. **Nog niet publiceren of deployen.**

## Stack

React 18 · Vite 5 · strict TypeScript · Tailwind CSS 3 (semantische tokens) ·
React Router 6 · React Hook Form + Zod · lucide-react · react-helmet-async.
Volgt de Coders01-standaard (zie `clients/roofing-center-react-mvp/`).

## Commando's (Windows PowerShell)

```powershell
cd C:\Users\dschu\Desktop\coders01-hk-vastgoed-clean\clients\all-in-daktechniek\rebuild
npm install
npm run dev            # http://localhost:5173
npm run build          # tsc --noEmit + vite build → dist/
npm run preview        # serveer de productie-build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint --max-warnings 0
npm run prepare:images # her-optimaliseer beelden uit ../assets/original
```

## Structuur

```
src/
├─ components/
│  ├─ layout/   SiteHeader, MobileNav (portal), DesktopNav, Logo,
│  │            SiteFooter, FloatingActions (mobiele bel/WhatsApp/offerte-balk), RootLayout
│  ├─ sections/ Hero, TrustStrip, ServicesGrid, AboutSection, ProjectsGallery,
│  │            ServiceAreaSection, CTASection, FaqList, PageHero
│  ├─ ui/       Button, Container, Section, SectionHeading
│  ├─ forms/    QuoteForm (RHF + Zod), fieldStyles
│  └─ SEO, StructuredData (RoofingContractor JSON-LD), ScrollToTop, ErrorBoundary
├─ data/        company (single source of truth), services, projects, faqs,
│               serviceArea, navigation
├─ pages/       Home, Diensten, ServiceDetail, Projecten, Werkgebied, OverOns,
│               Faq, Offerte, Contact, NotFound
├─ routes/      paths, AppRoutes
├─ hooks/ utils/ index.css
```

## Merk

Palet afgeleid van het bestaande logo (zwart + natuurlijk groen):
**ink #161A17 · green #5C9A3C · warm off-white #FBFAF7**. Tokens in `src/index.css`.

## Belangrijke regels

- **Geen bedrijfsfeiten verzinnen.** `src/data/company.ts` bevat alleen bevestigde
  gegevens; onbekende waarden zijn leeg met `TODO: Confirm with client` en verborgen
  in de UI. Zie `../docs/NEXT-ACTIONS.md` voor wat nog van Borre nodig is.
- Het offerteformulier is **frontend-only** (verstuurt niets; toont bevestiging).
  Een echt lead-endpoint hoort achter een backend (`VITE_LEAD_ENDPOINT`).
- Logo is een tekst-wordmerk tot Borre een hi-res/vector-logo levert.
- Niet committen/pushen of deployen zonder expliciete opdracht.
