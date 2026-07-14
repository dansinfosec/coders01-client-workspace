# Brand analysis — Sem & Co

How the logo and brand colours were determined and implemented. Two independent
sources agree (the logo and the live theme CSS), so the palette is well
supported. Colours that appear only as WordPress/Divi/Gutenberg defaults were
excluded.

## Logo files inspected
- `public/images/semenco/brand/semenco-logo.png` — the official logo
  (from `semenco.nl/wp-content/uploads/2025/12/Sem-Co-logo.png`).
  - **PNG, RGBA (transparent background)**, 8-bit, **400 × 286**, 46 KB.
  - Contains a hand-drawn **tree icon** + **"Sem & Co" wordmark**.
  - Colours in the logo: olive/sage ("Sem" + tree), navy ("& Co"), warm brown (trunk).
  - **Content fills the whole canvas (measured alpha bounding box margins = 0)** →
    no excessive whitespace, **no trimmed/optimized copy needed**.
  - **Single full-colour variant** — no separate light/dark version exists.
  - Readable at mobile nav size (wordmark is large within the mark); rendered at
    40–44 px height in the header.

## Live CSS / assets inspected
- `scraped-data/pages/index-aa6af3868c.html` — inline critical CSS (Divi "et-core").
- `https://semenco.nl/wp-content/et-cache/46/et-core-unified-deferred-46.min.css`.
- Evidence gathered by frequency + **semantic usage context** (which selector each
  colour is applied to). No bot protection was bypassed.

## Original discovered colours (with evidence)
| Hex | Where it is used on the live site | Role |
|-----|-----------------------------------|------|
| `#72744e` | `.et_pb_button{background}`, `.et_pb_promo{background}`, heading `color` | **Primary** (olive) |
| `#896b4c` | `#main-header{background}`, `#top-menu li ul{background}` | Header/menu (warm brown) |
| `#172c30` | `#footer-bottom{background}`, active-nav `color`, borders | Dark (navy) |
| `#82c0c7` | widget link `:hover{color}` | Accent (soft teal) |
| `#fafae1` | `linear-gradient(135deg,#fafae1,#67a671)` background | Light background (cream) |
| `#67a671` | same gradient | secondary green (noted, not adopted) |

Excluded as non-brand: `#2ea3f2` (Divi default accent), `#0693e3 #00d084 #ff6900
#fcb900 #cf2e2e #9b51e0 …` (Gutenberg default palette, each appears once),
`#313131 #f3f3f3 #e5e5e5` (Divi default text/greys).

## Final implemented colours
Semantic tokens in `src/index.css` (HSL channels) / documented in `src/data/brand.ts`:

| Token | Hex | Contrast /white | Notes |
|-------|-----|-----------------|-------|
| `--brand-primary` | `#72744e` | 4.86:1 | buttons, links, active nav, focus, progress, selected cards, eyebrows, icons |
| `--brand-primary-hover` | `#545735` | 6.82:1 | hover/active |
| `--brand-primary-soft` | pale olive | — | soft fills / active-nav bg |
| `--brand-secondary` | `#896b4c` | 4.92:1 | warm brown accents |
| `--brand-accent` | `#2c6c73` | 5.74:1 | **accessibility-adjusted** dark teal (from `#82c0c7`) |
| `--brand-accent-soft` | warm tint | — | small label / icon chips |
| `--brand-dark` | `#172c30` | 14.59:1 | footer accent, dark text basis |
| `--brand-light` | `#fafae1` | — | light background |
| `--text-primary` | `#1f3034` | 13.9:1 | body text (navy-derived) |
| `--text-secondary` | warm grey | 5.8:1 | secondary text |
| `--color-accent` (component) | `#795f3f` | 5.9:1 | **adjusted** warm brown for small label text |

## Colours adjusted for accessibility
- **Soft teal `#82c0c7` (2.04:1)** — fails text contrast; replaced with a **darker
  teal `#2c6c73` (5.74:1)** for any text/icon use. Light teal kept for decoration only.
- **Warm brown** for small label text darkened to **`#795f3f` (5.9:1)** so it stays
  legible on tinted (`accent-soft`) backgrounds.
- Primary olive and brown themselves pass AA (4.86 / 4.92) for normal text and for
  white text placed on them (buttons), so they were used as-is.

## Logo placement
- **Desktop + mobile header:** logo image (40–44 px tall), links to home, on a
  **light/white header** (the multicolour logo is unreadable on the live brown
  header, so a neutral header is used per the brief — the logo is never recoloured
  or filtered). `width`/`height` set → no layout shift.
- **Footer:** logo image (light background so it stays readable) + an olive top
  accent border.
- **theme-color** meta = `#72744e`.
- Open Graph image kept as the hero photograph (more compelling for sharing).

## Remaining uncertainties (confirm with client)
- **Favicon / browser icon:** no square icon-only logo variant exists; a cropped
  tree-icon favicon should be provided/approved before adding one.
- Whether the live **brown header** is intended long-term (we chose a light header
  for logo readability + contrast).
- Exact intended use of the **soft teal** and the **gradient green `#67a671`**.
- A **white/mono logo** variant would be needed if a dark header/footer is wanted.
