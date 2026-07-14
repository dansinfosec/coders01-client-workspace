# Content review notes

Notes captured while reviewing scraped content. Update as content is verified.

## Inspection crawl (Phase 1 scaffold)

A limited crawl (`--max-pages 8 --delay 1.5`, robots.txt respected) confirmed the
existing workspace crawler works against `https://semenco.nl/`. Result: 5 pages
OK, 1 skipped, 0 errors. Raw HTML is in `../pages/`, metadata in `../index.json`,
summary in `../crawl-report.json`.

### Pages discovered
| URL | Title |
|-----|-------|
| `/` | Kleinschalige logeeropvang met echte aandacht |
| `/over-ons` | Over ons - Sem & Co |
| `/crisisopvang` | Crisisopvang - Sem & Co |
| `/aanmelden` | Aanmelden - Sem & Co |
| `/contact` | Bot Verification *(anti-bot page — real content not captured)* |

### To verify / reconcile
- [ ] **URL structure differs from the scaffold routes.** Live site uses
      `/over-ons`; the scaffold uses `/over-sem-en-co`. Confirm the final URL map
      (and whether `/logeeropvang`, `/vakantieopvang`, `/werkwijze`, `/blog`
      exist on the live site — not seen in this limited crawl).
- [ ] Real homepage tagline is *"Kleinschalige logeeropvang met echte aandacht"* —
      use as a basis for the verified hero copy.
- [ ] `/contact` returned a bot-verification page; capture the real contact
      details another way (client-provided) rather than from the scrape.
- [ ] Do a fuller crawl (higher `--max-pages`) once a fuller review is wanted.
