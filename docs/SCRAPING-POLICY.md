# Scraping Policy

Rules for crawling and scraping in this workspace. These apply to every client
and every tool in `automation/`.

## Only public, authorized content

- Scrape **only** publicly accessible pages that we are authorized to work with
  (i.e. the client's own site, or a site the client has engaged us to rebuild).
- Never bypass logins, paywalls, CAPTCHAs, or access controls.
- Never scrape personal data beyond what is needed, and handle any that is
  collected in line with privacy law (e.g. GDPR).

## Be a polite crawler

- Respect `robots.txt` and `<meta name="robots">` directives.
- Rate-limit requests (default: 1 request/second, configurable) and back off on
  errors or `429` responses.
- Send an honest, identifiable User-Agent.
- Cache aggressively — never re-crawl what you already have in `scraped/`.

## Respect copyright & ownership

- Scraped content and assets belong to the client / original owner.
- Use them only to rebuild that client's site, not for any other purpose.
- Keep client data inside that client's folder; do not mix across clients.

## Secrets & safety

- Never commit API keys, credentials, or `.env` files.
- Store any credentials outside the repo or in ignored env files.

> When in doubt about whether something is authorized, **stop and ask** before
> crawling.
