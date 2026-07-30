# BM Carservice — Sitemap-voorstel (rebuild)

_Datum: 2026-07-30 · besluit: consolideren met behoud van bestaande URLs/SEO_

Doel: de ~30 inhoudelijke routes behouden voor SEO, maar bouwen met **dynamische
templates** i.p.v. losse pagina's, zodat onderhoud minimaal is.

## Routestructuur (React Router)

```
/                                   Home
/diensten                           Diensten-overzicht (grid)
/diensten/:slug                     Dienstdetail  ← één template, data-gedreven
      apk · onderhoud · accu · aircoservice · autobanden · reparatie ·
      uitlaat-vervangen · remmen-vervangen · distributieriem-vervangen ·
      distributieketting-vervangen · storingsdiagnose · koppeling-vervangen ·
      autolampen · winterbanden
/apk-zonder-afspraak                APK-hub (kernpropositie, aparte landingspagina)
/apk-zonder-afspraak/:slug          APK-locatie/variant ← template
      apk-check-amstelveen · apk-auto-amstelveen
/apk-keuring/:plaats                Lokale APK-landingspagina's ← template
      amsterdam · aalsmeer · uithoorn
/distributieketting                 Distributieketting-hub
/distributieketting/:merk           Merkvariant ← template (vw · audi · seat · skoda)
/chiptuning                         Chiptuning
/anwb                               Partnerbedrijf ANWB
/reviews                            Reviews (client-side paginatie i.p.v. 15 URL's)
/afspraak                           Afspraak maken (formulier)
/contact                            Contact (adres, kaart, openingstijden, formulier)
/cookiebeleid  /privacy             Legal
*                                   404
```

## URL-migratie / redirects
- Behoud exact: `/diensten/*`, `/distributieketting/*`, `/apk-keuring-*`, `/anwb`,
  `/chiptuning`, `/apk-zonder-afspraak(/*)`, `/contact`.
- `/remmen-vervangen` → canoniek onder `/diensten/remmen-vervangen` (301, oude blijft werken).
- `/afspraak-maken` + `/afspraak-maken/details` → `/afspraak` (301).
- `/apk-keuring-amsterdam` behouden **of** 301 → `/apk-keuring/amsterdam` (kiezen met klant;
  standaard = bestaande URL's 1:1 behouden voor zekerheid).
- `/reviews/show?page=N` → `/reviews` (paginatie client-side).

## Consolidatiewinst
14 dienstpagina's + 4 merk- + 3 locatie- + 2 APK-varianten = **23 losse pagina's → 4 templates**.
Alle content leeft in `src/data/*.ts`; nieuwe dienst = één data-object toevoegen.
