# SITEMAP-PROPOSAL — nieuwe website All-in Daktechniek

_Voorstel 2026-07-21. Uitgangspunt: bestaande content + doelen uit de brief._

## Voorgestelde structuur

```
/                         Home
/diensten                 Dienstenoverzicht  (NIEUW — vervangt "Diensten → #")
├─ /diensten/platte-daken
├─ /diensten/pannendaken
├─ /diensten/lood-en-zinkwerk
├─ /diensten/schoorstenen
├─ /diensten/dakisolatie
├─ /diensten/epdm
└─ /diensten/inspectie-en-onderhoud
/projecten                Projecten / uitgevoerd werk  (galerij i.p.v. 3 lege pagina's)
/werkgebied               Werkgebied  (NIEUW — lokale SEO; regio's van Borre)
/over-ons                 Over ons  (NIEUW — uit homepage-blok + later teamfoto's)
/veelgestelde-vragen      FAQ  (NIEUW — uit terugkerende vragen in dienstteksten)
/offerte                  Offerte aanvragen  (bestaand formulier, verbeterd)
/contact                  Contact  (NAP + kaart + formulier)
```

Plus niet-menu: `/privacy` (privacyverklaring), `404`.

## Belangrijkste wijzigingen t.o.v. de huidige site

| Wijziging | Reden |
|---|---|
| **Dienstenoverzicht** als echte pagina | "Diensten" linkt nu naar `#`; nodig als hub |
| Diensten onder `/diensten/*` | Nette hiërarchie + interne link-structuur (SEO) |
| **Over ons** toegevoegd | Bestaat nu niet; vertrouwen + lokaal verhaal |
| **Werkgebied** toegevoegd | Kerndoel "lokale SEO"; nu volledig afwezig |
| **FAQ** toegevoegd | Verlaagt drempel + long-tail SEO |
| Projecten → één galerij | 3 vrijwel lege detailpagina's samengevoegd |
| Losse belverzoek/contact-formulieren | Samengevoegd tot één offerteflow + belknop |
| `renovatie` / `service onderhoud` | Onderbrengen bij bestaande diensten (geen losse pagina's tenzij Borre dat wil) |

## URL-migratie (oud → nieuw, voor latere redirects bij livegang)

| Oud | Nieuw |
|---|---|
| `/platte-daken/` | `/diensten/platte-daken` |
| `/pannendaken/` | `/diensten/pannendaken` |
| `/lood-en-zinkwerk/` | `/diensten/lood-en-zinkwerk` |
| `/schoorstenen/` | `/diensten/schoorstenen` |
| `/dakisolatie/` | `/diensten/dakisolatie` |
| `/epdm/` | `/diensten/epdm` |
| `/inspectie-en-dak-onderhoud/` | `/diensten/inspectie-en-onderhoud` |
| `/projecten/` (+ 3 detailpagina's) | `/projecten` |
| `/offerte-formulier/` | `/offerte` |
| `/contact/` | `/contact` |

> Redirects pas instellen bij een eventuele echte livegang (niet nu). Genoteerd zodat
> lokale SEO-waarde behouden blijft.

## Navigatie (voorstel)

**Header:** Home · Diensten ▾ · Projecten · Werkgebied · Over ons · Contact +
knop **Offerte aanvragen** (+ bel/WhatsApp op mobiel).
**Footer:** dienstenlijst · NAP + KvK · openingstijden (na bevestiging) · Facebook ·
privacy · sitemap.

## Demo-scope (fase 1)

De eerste demo bouwt **Home** volledig uit met alle kernsecties (zie DESIGN-DIRECTION)
en zet de overige routes als nette pagina's neer met echte content waar beschikbaar.
Werkgebied blijft grotendeels een raamwerk tot Borre de regio's bevestigt.
