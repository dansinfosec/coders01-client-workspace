# BM Carservice — SEO-audit & migratieplan

_Datum: 2026-07-30_

## Nulmeting (huidige site)
| Aspect | Status |
|---|---|
| `<title>` | Aanwezig, maar generiek: `BM Carservice - {paginanaam}` |
| `<meta description>` | **Onbruikbaar** — duplicaat van de titel op elke pagina; homepage + cookiebeleid missen er zelfs een |
| `<h1>` | **Ontbreekt op de homepage** (start bij h2); elders wisselend |
| Open Graph | Basaal (`og:site_name`, `og:title=Home`, `og:type`, `og:url`) — geen `og:image`/`og:description` |
| Structured data | Niet aangetroffen (geen LocalBusiness/AutoRepair schema) |
| Canonicals | Per pagina aanwezig, maar reviews-paginatie (`?page=1..15`) zonder duidelijke strategie |
| Robots.txt | Aanwezig en gerespecteerd |
| Sitemap.xml | Te verifiëren |

## Doelen rebuild (grote winst mogelijk)
1. **Unieke, keyword-rijke titles per pagina** — bv. `APK keuring Amstelveen zonder afspraak | BM Carservice`.
2. **Echte meta-descriptions** (±150 tekens, uniek, met CTA) — via `react-helmet-async`.
3. **Correcte koppenhiërarchie**: één `<h1>` per pagina met kernkeyword + locatie.
4. **Structured data** toevoegen: `AutoRepair`/`LocalBusiness` (NAW, openingstijden, geo,
   `areaServed`), `BreadcrumbList`, evt. `AggregateRating` **alleen** met echte reviewbron.
5. **Behoud bestaande URL's** + nette 301's (zie SITEMAP-PROPOSAL) → geen ranking-verlies.
6. **Core Web Vitals**: expliciete afbeeldingsafmetingen, WebP, lazy-load, lichte hero i.p.v.
   zware slick-slider.
7. **Lokale SEO**: consistente NAP, Google Business-link, locatiepagina's behouden.

## Let op — niet verzinnen
`AggregateRating`, aantal reviews, sterren, responstijden en garanties **alleen** met een
door de klant bevestigde bron. Tot dan: weglaten of neutraal formuleren.
