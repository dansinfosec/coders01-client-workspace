# BM Carservice — Content-inventaris

_Datum: 2026-07-30_

Volledige schone tekst per pagina staat in **`../scraped/text/*.txt`** (33 bestanden,
kop-/alinea-/lijststructuur behouden). Dit is de bron voor `rebuild/src/data/*.ts`.

## Paginacategorieën
| Categorie | Aantal | Pagina's |
|---|---|---|
| Home | 1 | `/` |
| Diensten-hub + detail | 1 + 14 | `/diensten` + apk, onderhoud, accu, aircoservice, autobanden, reparatie, uitlaat-vervangen, remmen-vervangen, distributieriem-vervangen, distributieketting-vervangen, storingsdiagnose, koppeling-vervangen, autolampen, winterbanden |
| APK-landingspagina's | 6 | `/apk-zonder-afspraak` (+ apk-check/apk-auto-amstelveen), `/apk-keuring-amsterdam/-aalsmeer/-uithoorn` |
| Distributieketting | 1 + 4 | hub + vw/audi/seat/skoda |
| Chiptuning | 1 | `/chiptuning` |
| ANWB-partner | 1 | `/anwb` |
| Reviews | 1 (+ paginatie) | `/reviews` |
| Afspraak | 1 | `/afspraak-maken/details` (formulier) |
| Contact | 1 | `/contact` (openingstijden, NAW) |
| Legal | 1 | `/cookiebeleid` |

## Kerninhoud (VERIFIED van de site)
- **Diensten** (14): APK, onderhoud (klein/groot), accu, aircoservice, autobanden,
  reparatie, uitlaat, remmen, distributieriem, distributieketting, storingsdiagnose,
  koppeling, autolampen, winterbanden. Elk met een uitgebreide inhoudelijke tekst.
- **Propositie**: APK zonder afspraak, klaar-terwijl-u-wacht, vervangend vervoer, gratis
  APK bij grote beurt, alle merken, RDW-gecertificeerd, ANWB-partner.
- **Distributieketting** is een expliciete specialisatie met merkpagina's (VW/Audi/Seat/Skoda).
- **Contact/openingstijden**: ma–vr 08:30–17:30 (middagpauze 13:00–13:45), za/zo gesloten.

## Voor de rebuild
- Elke dienst → object in `src/data/services.ts` (`slug`, `title`, `seoTitle`,
  `seoDescription`, `intro[]`, `body`, `image`, `icon`). Tekst overnemen uit `scraped/text/`,
  spelling normaliseren ("BM Carservice", "APK").
- Reviews → **niet overnemen als echte quotes** zonder bevestigde bron (`reviews__show.txt`
  bevat de huidige teksten; herkomst verifiëren met klant).
- Prijzen: nergens genoemd → niet invullen.
