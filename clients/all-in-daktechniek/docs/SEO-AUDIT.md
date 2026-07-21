# SEO-AUDIT — all-indaktechniek.nl

_Onderzocht 2026-07-21. Focus: lokale vindbaarheid dakdekker Westland/Honselersdijk._

## Samenvatting

De site draait op WordPress + Yoast, dus de **techniek** is aanwezig (sitemap, robots,
canonical, basis-JSON-LD), maar de **inhoudelijke SEO is nagenoeg leeg** en de **lokale
SEO ontbreekt volledig**. Voor een lokaal dakdekkersbedrijf is dat de grootste gemiste
kans.

## Bevindingen per signaal

| Signaal | Huidige staat | Oordeel |
|---|---|---|
| `<title>` homepage | `…De Dakdekker met ervaring. ☎ nummer.` | 🔴 placeholder "nummer." |
| Meta description | **Op geen enkele pagina aanwezig** | 🔴 |
| Titels subpagina's | Aanwezig, maar inconsistent ("All-In" vs "All-in") | 🟡 |
| H1 per pagina | Aanwezig, 1 per pagina | 🟢 |
| Canonical | Aanwezig (Yoast) | 🟢 |
| Open Graph | Aanwezig; `og:image` = oude `slider-1.jpg` (2019) | 🟡 |
| robots.txt | `Disallow:` leeg → alles toegestaan; sitemap gelinkt | 🟢 |
| XML-sitemap | Yoast `sitemap_index.xml` (page/attachment/projecten) | 🟢 |
| Structured data | `WebPage` + `WebSite` | 🔴 geen `LocalBusiness`/`RoofingContractor` |
| NAP-consistentie | Adres/tel/KvK in footer, maar niet in schema | 🟡 |
| Google Maps / route | Niet ingebed | 🔴 (lokaal belangrijk) |
| Afbeelding-alt | Deels leeg; hero `alt="Lorem ipsum"` | 🔴 |
| Interne links | Diensten-menu → `#` (geen overzichtspagina) | 🟡 |
| Mobielvriendelijk | Viewport ok, maar zware/rommelige pagina's | 🟡 |
| Snelheid | 11 CSS + 12 JS + jQuery + zware JPG's | 🔴 render-blocking |
| HTTPS / canonical host | `https://www.` correct | 🟢 |
| Analytics + AVG | gtag zonder cookiebanner | 🔴 juridisch risico |

## Kansen voor de rebuild

1. **Per pagina een unieke `<title>` + `meta description`** met dienst + regio
   (bijv. "Platte daken & bitumen dakbedekking in het Westland | All-in Daktechniek").
2. **`LocalBusiness` / `RoofingContractor` JSON-LD** met NAP, KvK, geo, openingstijden
   (na bevestiging), `sameAs` Facebook. Grootste lokale winst.
3. **Werkgebied-pagina** met de plaatsen die Borre bedient (regio bevestigen) →
   lokale landingscontent.
4. **Dienstenoverzicht-pagina** + interne links van elke dienst naar offerte/contact.
5. **Schone, snelle statische build** (Vite) i.p.v. WordPress/WPBakery → betere Core
   Web Vitals.
6. **Echte alt-teksten** op alle beelden; correcte `og:image`.
7. **Sitemap + robots** opnieuw genereren voor de statische site.
8. **Consent-vriendelijke analytics** (of pas na toestemming laden).

## Aannames / grenzen

- Geen externe keyword- of concurrentieanalyse uitgevoerd (opdracht: geen zelfstandig
  extern onderzoek). Regio/plaatsnamen voor lokale SEO **moeten van Borre komen** —
  alleen de vestiging (Honselersdijk, gem. Westland) is bekend uit het adres.
- Core Web Vitals niet exact gemeten; oordeel "snelheid" is gebaseerd op de asset- en
  scriptzwaarte.
