# BM Carservice — Rebuild-plan (Fase 4)

_Datum: 2026-07-30_

## Stack
Vite 5 · React 18 · **strict TypeScript** · Tailwind 3 · react-router-dom 6 ·
react-hook-form + zod (afspraakformulier) · react-helmet-async (SEO) · lucide-react (iconen).
Hergebruikt de bewezen build-config van `all-in-daktechniek`; **eigen** designsysteem.

## Designsysteem (uit DESIGN-DIRECTION.md)
- **Kleur (CSS-variabelen → Tailwind-tokens):** `signal` geel `#FFD100` (signaalaccent),
  `ink` werkplaats-antraciet `#15171C`, `mark` BM-rood `#D81E05` (alleen merk + hoofd-CTA),
  `concrete` `#F4F3EF`, `steel` `#6B7280`, `pass` keuring-groen `#1E7A46`.
- **Type:** display **Archivo** (signing-koppen) · body **IBM Plex Sans** · utility **IBM Plex Mono**
  (labels/tags/keuringsstrook).
- **Signature:** diagonale **veiligheidsstreep-divider** (geel-op-antraciet) tussen secties.
- **Hero:** "receptiebord" met mono-statusregel `GEOPEND · APK ZONDER AFSPRAAK`, geen slider.

## Routes (bestaande URLs 1:1 behouden → nul SEO-risico)
```
/                                Home
/diensten                        Diensten-overzicht
/diensten/:slug                  Dienstdetail  (14 diensten, 1 template)
/remmen-vervangen                → dienst (bestaande losse URL behouden)
/apk-zonder-afspraak             APK-hub (kernpropositie)
/apk-zonder-afspraak/:slug       APK-variant (check/auto Amstelveen)  ← landing-template
/apk-keuring-amsterdam|-aalsmeer|-uithoorn   lokale APK-landing  ← landing-template
/chiptuning                      Landing
/distributieketting              Hub
/distributieketting/:slug        Merk (vw/audi/seat/skoda)  ← landing-template
/anwb                            ANWB-partner
/reviews                         Reviews (client-side, geen ?page-URLs)
/afspraak                        Afspraakformulier   (/afspraak-maken* → 301)
/contact                         Contact + openingstijden + kaart
/cookiebeleid  /privacy          Legal
*                                404
```
Data-gedreven templates: nieuwe dienst/locatie/merk = één object in `src/data/*`.

## Componentarchitectuur
- `ui/` Container, Section, Button, SectionHeading, Tag (mono-label), **HazardDivider** (signature)
- `layout/` RootLayout, SiteHeader, DesktopNav, MobileNav, SiteFooter, Logo, FloatingActions
- `sections/` Hero (receptiebord), StatusBar, ServicesGrid, TrustStrip, USPList, ServiceArea,
  OpeningHours, CTASection, ReviewsTeaser
- `forms/` AppointmentForm (react-hook-form + zod)
- `SEO`, `StructuredData` (`AutoRepair` JSON-LD), `ScrollToTop`, `ErrorBoundary`

## SEO-verbeteringen (t.o.v. huidige site)
Unieke `<title>` + echte meta-description per pagina · correcte `<h1>` · `AutoRepair`/
`LocalBusiness` structured data (NAW, openingstijden, areaServed) · Open Graph · CWV
(WebP + expliciete afmetingen + lazy-load, geen zware slider).

## Data-integriteit (CLAUDE.md)
Content uit `scraped/text/*`, geparafraseerd. **Niets verzinnen:** geen prijzen, geen
`AggregateRating`/reviews-sterren zonder bevestigde bron, KvK/BTW = `TODO`. Het
afspraakformulier is frontend-only (nette client-side validatie; endpoint = `TODO klant`).

## Verificatie
`npm run lint` (max-warnings 0) · `tsc --noEmit` · `npm run build` · responsive 320/375/390/430/desktop · browser-screenshot-check.
