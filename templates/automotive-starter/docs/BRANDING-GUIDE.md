# Branding-gids

Alle visuele identiteit staat op één plek: **`src/config/brand.ts`**. Bij het laden
schrijft `applyBrand()` de tokens naar CSS-variabelen op `:root`; Tailwind's
semantische kleuren (`bg-primary`, `text-accent`, `border-line`, …) verwijzen naar
die variabelen. Je hoeft dus **geen** Tailwind-classes of componenten aan te passen
om te herbranden.

---

## Kleuren

Kleuren staan als **HSL-kanalen** (`"H S% L%"`, zonder `hsl()`), zodat opacity-varianten
als `bg-primary/20` blijven werken.

De belangrijkste rollen om per klant te wijzigen (in `brand.tokens`):

| Token | Rol | Voorbeeld-Tailwind |
|---|---|---|
| `primary` (+ `primaryStrong`, `primarySoft`) | Merkkleur: links, koppen-accent, knoppen | `bg-primary`, `text-primary` |
| `accent` (+ `accentStrong`) | Spaarzame energie / highlight | `bg-accent` |
| `secondary` (+ `secondarySoft`) | Neutrale steun-/labelkleur | `text-secondary` |
| `dark` (+ `dark900…600`) | Donkere vlakken (footer, hero) | `bg-asphalt` |
| `paper`, `surface`, `surfaceMuted` | Achtergronden | `bg-paper`, `bg-surface` |
| `textStrong`, `textBody`, `textMuted`, `textInvert` | Tekstkleuren | `text-text-body` |
| `line`, `lineStrong`, `lineInvert` | Randen/scheidingslijnen | `border-line` |
| `focus`, `error`, `success` | Functioneel | — |
| `statusAvailable/Reserved/Sold/New/Soon` | Occasion-statuslabels | `text-status-available` |
| `plateYellow`, `plateBlue`, `plateInk` | Kentekenplaat-signature (laat meestal staan) | — |

> **Tip:** kies een `primary` met genoeg contrast op `paper` (witte tekst op `primary`
> moet leesbaar zijn). Controleer contrast (WCAG AA) na het wisselen.

### Zo wijzig je kleuren

1. Pas de HSL-waarden in `brand.tokens` aan.
2. (Optioneel, tegen een korte flits bij de allereerste paint) zet dezelfde waarden
   ook in de `:root`-fallback in `src/index.css`.
3. Werk `themeColor` (`src/config/site.ts`) en `<meta name="theme-color">` (`index.html`)
   bij zodat de mobiele browserbalk matcht met `dark`.

De Tailwind-tokennamen (`asphalt`, `petrol`, `torque`, `steel`) zijn merk-neutrale
interne namen — je hoeft ze niet te hernoemen; alleen de wáárden veranderen.

## Radius

`brand.radius` stuurt de basis-`rounded` (via `--brand-radius`). Voor een strakker of
ronder ontwerp pas je één waarde aan. De schaal `rounded-lg/xl/2xl` staat vast in
`tailwind.config.js` als je die fijnmaziger wilt bijstellen.

## Fonts

`brand.fonts` (`display`, `body`, `mono`) voedt de Tailwind-families `font-display`,
`font-sans`, `font-mono` via CSS-variabelen.

Let op: de **fontbestanden** komen uit `@fontsource`-imports boven in `src/index.css`.
Wil je andere fonts?

1. `npm i @fontsource-variable/<font>` (of `@fontsource/<font>`).
2. Voeg de `@import` toe boven in `src/index.css`.
3. Zet de family-namen in `brand.fonts` (inclusief fallback-stack).

## Logo

In `brand.logo`:

- **Tekstwordmark (default):** zet `text` (hoofdwoord) en optioneel `badge` (geaccentueerd
  blokje). `imageSrc` blijft `null`.
- **Afbeeldingslogo:** zet `imageSrc` op een pad in `public/assets/brand/` (bijv.
  `/assets/brand/logo.svg`) en `imageSrcInvert` op een lichte variant voor donkere
  achtergronden (header/footer). Het `Logo`-component kiest automatisch de juiste.

Gebruik bij voorkeur **SVG** of een transparante PNG op ~2× hoogte.

## Favicon

Zet `brand.favicon` en vervang **`public/favicon.svg`** door de merk-favicon. Verwijs
er ook naar in `index.html` (`<link rel="icon">`) als je een ander bestandstype gebruikt.

## Snelle checklist

- [ ] `brand.tokens` kleuren vervangen
- [ ] `themeColor` + `index.html` theme-color bijgewerkt
- [ ] Logo (tekst of afbeelding) ingesteld
- [ ] Favicon vervangen
- [ ] Fonts kloppen (imports + families)
- [ ] Contrast (AA) gecontroleerd op knoppen en tekst
