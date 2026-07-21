# DESIGN-DIRECTION — All-in Daktechniek

_Voorstel 2026-07-21. Doel: geloofwaardig, betrouwbaar, mobiel-sterk dakdekkersmerk —_
_géén generieke AI-look. Palet afgeleid van het bestaande logo, niet verzonnen._

## Merkbasis (uit bestaand logo)

Het huidige logo (`assets/original/logo.png`) is **zwarte woordmerk-tekst met één
natuurlijk-groen accent**. Gesampelde kleuren:

- Zwart/antraciet: `#080808` (dominant)
- Groen accent: **`#90C078`** (natuurlijk/olijfgroen)

Daarop bouwen we het palet — herkenbaar, maar moderner en contrastrijker.

## Kleurenpalet (semantische tokens → CSS-variabelen, Coders01-conventie)

| Token | Kleur | Gebruik |
|---|---|---|
| `ink` / antraciet | `#161A17` | Header, footer, koppen, hero-overlay |
| `ink-800/700` | donkere varianten | Vlakken, borders-invert |
| `green` (accent) | `#5C9A3C` (verdiept t.o.v. logo `#90C078`) | Primaire knoppen, actief, iconen |
| `green-strong` | `#3F7327` | Groene tekst op licht (contrast AA) |
| `green-soft` | `#EAF2E1` | Zachte accentvlakken |
| `surface` | `#FBFAF7` | Warme off-white achtergrond |
| `surface-muted` | `#F1EFE9` | Secties, kaarten |
| `text-strong/body/muted` | antraciet-schaal | Tekst |

> **Bewust anders dan Roofing Center** (navy `#0D222D` + mint `#45D38E` + cream). All-in
> krijgt een **antraciet + natuurlijk-groen + warm wit** identiteit, passend bij het
> eigen logo. Elk klantproject houdt zijn eigen merk (workspace-regel).

## Stijlprincipes

- **Solide & nuchter**, geen glimmende AI-stijl. Duidelijke koppen, veel witruimte,
  echte werkfoto's als bewijs.
- **Mobiel-first.** Sticky bel/WhatsApp-actiebalk op mobiel; grote tikdoelen (min 44px);
  offerte-CTA altijd binnen bereik.
- **Vertrouwen bovenaan**, met alléén echte troeven (VCA, garantie, team van 6, KvK,
  "kosteloze inspectie") — feitelijk gebracht, geen opgeklopte superlatieven.
- **Typografie:** system-ui stack (zoals de andere projecten), zware koppen (bold/
  extrabold), rustige body. Geen custom webfont in fase 1.
- **Beeld:** echte projectfoto's (`project-*`, `pannendaken-*`, `dakisolatie-*`) krijgen
  voorrang boven de generieke sliders.
- **Toegankelijkheid:** zichtbare focus-ringen, semantische landmarks, één `<h1>` per
  pagina, `prefers-reduced-motion` gerespecteerd, WCAG AA-contrast.
- **Geen gradients-als-gimmick, subtiele transitions**, in lijn met de rustige,
  betrouwbare toon (afwijkend van Batterijenplan's strakke zwart/geel-stijl — dit is een
  ander merk).

## Homepage-secties (fase-1 demo)

1. **Header** + mobiele slide-over navigatie (portal-patroon, zoals roofing-center).
2. **Hero** — sterke claim ("De dakdekker met ervaring" — bestaand), offerte-CTA +
   bel/WhatsApp-knop, echte dakfoto.
3. **Vertrouwensbalk** — VCA · garantie · team van 6 · kosteloze inspectie (alleen echte
   feiten; garantiegetal per dienst tot Borre één waarde bevestigt).
4. **Dienstenblok** — 7 diensten met icoon + korte omschrijving, link naar dienstpagina.
5. **Over ons** — uit bestaand homepage-blok (team van 6, ervaring, VCA, garantie).
6. **Projecten** — galerij met echte werkfoto's.
7. **Werkgebied / lokale SEO** — Honselersdijk/Westland als basis; regio's van Borre.
8. **Offerteformulier** — één heldere flow (velden uit bestaand formulier).
9. **Footer** — NAP, KvK, Facebook, diensten, openingstijden (na bevestiging).

## Component-hergebruik (Coders01)

Patronen overnemen uit `roofing-center-react-mvp`: `SiteHeader`/`MobileNav`
(portal + scroll-lock + focus-trap), `Button`, `Container`, `useLockBodyScroll`, `cn()`,
`src/data/*` als single source of truth, `react-helmet-async` voor SEO, RHF+Zod voor het
formulier. **Merkkleuren en content zijn All-in-specifiek.**
