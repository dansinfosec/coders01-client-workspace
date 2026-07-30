# Beeldstrategie & (gegenereerde) assets

## Belangrijk: er zijn géén AI-beelden gegenereerd

De opdracht vroeg om realistische automotive visuals (hero, werkplaats, dienstfoto's) te
**genereren**. De beschikbare beeldgeneratie (Higgsfield) is op dit account **niet bruikbaar**:
elke image-model gaf `free_trial_model_requires_plan` (betaald abonnement vereist) en de
free-trial "unlim" is verlopen (`unlim.available: false`). Er is daarom **niets gegenereerd** —
en dus wordt ook niets als "echte foto" gepresenteerd dat het niet is.

In plaats daarvan gebruikt de redesign **echte foto's** en nette graphite-treatments. Dat is
eerlijker dan AI-beelden als echt materiaal tonen.

## Gebruikte echte beelden

| Bestand | Doel | Pagina | Bron | Alt-tekst | Status |
|---|---|---|---|---|---|
| `public/assets/general/werkplaats-gevel.jpg` | Hero-achtergrond (full-width, met graphite-overlay) | Home | Echte foto van het Fix-it All-pand (uit occasion-listing Volvo V60, Autodealers-voorraad) | leeg (`aria-hidden`, decoratief) | In gebruik |
| `public/assets/general/forecourt.jpg` | "Auto verkopen"-split beeld | Home | Echte foto van de oprit/gevel (uit occasion-listing Peugeot Partner) | "Auto's op de oprit voor onze werkplaats" | In gebruik |
| `public/assets/occasions/<slug>/*.jpg` (292×) | Occasionfoto's | Occasions + detail + home-strook | Echte dealerfoto's (Autodealers-voorraad, did=5359) | per foto beschrijvend | In gebruik |

> De twee `general/`-beelden zijn **echte** foto's van het pand van de klant (ze tonen de gevel met
> "FIX-IT ALL"-bord en huisnummer 242). Ze komen uit de occasion-listings en zijn dus authentiek —
> geen stock, geen AI. De hero gebruikt ze decoratief met een zware graphite-overlay.

## Bewust NIET gedaan

- **Geen AI-gegenereerde werkplaats-/monteur-/dienstfoto's.** De dienstpagina's en secties
  gebruiken een graphite-hero + dienst-iconografie i.p.v. verzonnen fotografie. Zo wordt nergens
  een gegenereerd/stock-beeld als "ons team" of "onze werkplaats" gepresenteerd.
- **Geen misleidende claims** bij beelden (geen "ons team" bij personen).

## Nog gewenste échte klantfoto's

Voor een volledig premium resultaat zijn eigen, professionele foto's van de klant nodig:

1. Werkplaatsinterieur (brug, servicebalie, netjes ingerichte werkplaats).
2. Gevel/entree overdag (establishing shot).
3. Dienst-actiefoto's: APK-keuring, onderhoud, banden, airco, uitlaat/laswerk, diagnose, reparatie.
4. Teamfoto('s) — alleen met toestemming, voor "Over ons".

Plaats deze onder `public/assets/generated/services/` en `public/assets/generated/general/`
(mappen zijn voorbereid) met SEO-vriendelijke namen, en koppel ze in de dienst- en homepagina's.
Zolang die er niet zijn, blijft de huidige eerlijke graphite-uitstraling staan.

## Als beeldgeneratie later wél beschikbaar is

Genereer met een fotorealistisch model, aspect 16:9 (hero's) en 4:3 (dienstkaarten), met een
consistente grading: **donkere graphite-tonen + subtiel Fix-it All-rood accent**, Nederlands/Europees
autobedrijf, neutrale kleding, geen leesbare tekst/logo's, geen futuristische showroom. Label ze in
dit bestand als **AI-generated** en gebruik neutrale alt-teksten (bijv. "Illustratieve
werkplaatsomgeving").
