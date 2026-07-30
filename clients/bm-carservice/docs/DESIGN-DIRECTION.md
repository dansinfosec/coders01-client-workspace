# BM Carservice — Designrichting

_Datum: 2026-07-30 · opgesteld met de frontend-design methode_

## Uitgangspunt (subject → richting)
- **Wie:** vakgarage in Amstelveen. **Publiek:** lokale autobezitters die snel, eerlijk en
  zonder gedoe een APK/onderhoud willen. **Kernactie van de site:** afspraak maken / binnenlopen / bellen.
- **Emotionele kern:** _"Uw veiligheid is ons beroep."_ Kernpropositie: **APK zonder afspraak**.
- **Materiële wereld:** het pand is knalgeel met donkerblauwe werkplaats-signing
  (`WERKPLAATS` / `RECEPTIE`), keuring = checklist/goedkeuring, precisie, veiligheid.

De richting put uit die eigen wereld — **werkplaats-signing + keurings-precisie** — in plaats
van de generieke autogarage-look (blauw/rood verloop-hero + stockfoto monteur).

## Kleur (functioneel, niet decoratief)
| Token | Hex | Rol |
|---|---|---|
| `signal` (signaalgeel) | `#FFD100` | Wayfinding/accent — als veiligheids-/bewegwijzeringskleur, spaarzaam |
| `ink` (werkplaats-antraciet) | `#15171C` | Structurele basis, signing, tekst |
| `steel` | `#6B7280` | Secundaire tekst, hairlines |
| `concrete` | `#F4F3EF` | Lichte achtergrond (werkplaatsvloer-neutraal) |
| `mark` (BM-rood) | `#D81E05` | **Alleen** merkteken + primaire CTA ("Bel"/"Maak afspraak") |
| `pass` (keuring-groen) | `#1E7A46` | Uitsluitend echte pass-/goedgekeurd-signalen (RDW ✓), zeer spaarzaam |

Geel is een **signaalkleur**, geen vlaktevuller — dit onderscheidt de rebuild van de huidige
"alles-geel" template en van het generieke rood/blauw-verloop.

## Typografie
| Rol | Font | Gebruik |
|---|---|---|
| Display | **Archivo** (Expanded, 700–800) | Blokkige signing-koppen — echoot de werkplaatsletters |
| Body | **IBM Plex Sans** | Neutraal, technisch-eerlijk, goed leesbaar |
| Utility/mono | **IBM Plex Mono** | Labels, openingstijden, telefoon, keuringsstrook, tags (`RECEPTIE`-stijl) |

De mono-laag is thematisch: een keuringsrapport/receptiebord "leest" als monospace data.
(Vervangt de generieke Lato-only zetting van de huidige site.)

## Layout
- Basis: `concrete` vlak, `ink` structuurpanelen, geel als bewegwijzering, rood alleen op de
  hoofd-CTA. Sterk links-uitgelijnd raster, royale witruimte, signing-achtige koppen.
- **Hero = receptiebord.** Antraciet paneel in de stijl van de eigen `WERKPLAATS/RECEPTIE`-
  signing, met één mono-statusregel: `GEOPEND · MA–VR 08:30–17:30 · APK ZONDER AFSPRAAK`.
  Directe acties: **Bel** (rood) + **Maak afspraak**. Geen zware slider.
- **Diensten = dienstenbord**: grid met icoon + mono-tag per dienst (een catalogus, géén
  volgorde → dus **geen** 01/02/03-nummering).
- Contact/openingstijden als mono "openingsstrook".

## Signature-element
Eén onthoudbaar element: de **veiligheidsstreep-divider** — een diagonale geel-op-antraciet
hazard-band die secties scheidt, rechtstreeks uit de werkplaats-/garagedeur-taal en uit
_"veiligheid is ons beroep"_. Bewust **één à twee keer** ingezet; de rest blijft rustig.

## Bewust vermeden
- Generieke autogarage-hero met blauw/rood verloop + stockfoto.
- "Alles-geel" vlakken (huidige site) — geel wordt teruggebracht tot signaalfunctie.
- Nummer-markers 01/02/03 op diensten (geen echte sequentie).

## Kwaliteitsvloer (bij de bouw)
Responsive t/m 320px · zichtbare toetsenbord-focus · `prefers-reduced-motion` gerespecteerd ·
expliciete afbeeldingsafmetingen (CWV). Motion: één ingetogen page-load reveal + hover-
microinteracties op CTA's; niet meer.
