# Image asset manifest

Downloaded via the shared image-downloader from the saved HTML of
`https://semenco.nl/`. The live site is largely JS-rendered, so only images
present in the static HTML were found (logo, one atmosphere photo, partner/
quality logos). Atmospheric photography of accommodation/activities/team is
**not yet available** and is tracked in `TODO.md → Design`.

Alt text is conservative — it never names or identifies people, because the
source does not confirm identities.

| Local file | In app as key | Source URL | Dimensions | Suggested alt | Notes |
|---|---|---|---|---|---|
| `public/images/semenco/brand/semenco-logo.png` | `logo` | `.../2025/12/Sem-Co-logo.png` | 400×286 | "Sem & Co" | Brand logo. |
| `public/images/semenco/hero/bospark-buitenspelen.jpg` | `homeHero` | `.../2025/12/Deze-gebruiken.jpg` | 1089×1089 | "Buitenspelen bij een houten schommel tussen de bomen op het bospark, met een bungalow op de achtergrond" | Real atmosphere photo (wooded park, swing, bungalow). Used for the hero. Do **not** claim who is shown. |
| `public/images/semenco/misc/partner-bpsw.png` | `partnerBpsw` | `.../2026/03/BPSW-logo-website.png` | 133×108 | "BPSW" | Quality/partner logo on the live site. Confirm usage rights + meaning with client. |
| `public/images/semenco/misc/partner-inspectie.png` | `partnerInspectie` | `.../2026/03/LOGO-inspectie-website.png` | 259×117 | "Inspectie" | Partner/quality logo. Confirm with client. |
| `public/images/semenco/misc/partner-klachtenportaal.png` | `partnerKlachtenportaal` | `.../2026/03/Logo-Klachtenportaal-website.png` | 362×107 | "Klachtenportaal" | Partner/quality logo. Confirm with client. |
| `public/images/semenco/misc/partner-spoor030.png` | `partnerSpoor030` | `.../2026/03/Logo-Spoor030-website.png` | 248×111 | "Spoor030" | Partner/quality logo. Confirm with client. |

**Not downloaded on purpose:** tracking pixels, favicons, tiny/decorative
assets, and `veine-dagen-april-2026.png` (a dated promotional banner). No stock
photos were added.

**Still needed (request from client):** hero/secondary photography of the
bungalows (accommodation), the park/surroundings (location), activities, and any
team photos that are cleared for publication.
