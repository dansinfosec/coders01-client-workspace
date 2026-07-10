# prompts/

Reusable AI prompts for each stage of the workflow. Keep prompts here so they are
versioned, shared across clients, and easy to iterate on.

Suggested prompts (add as `*.md` files):
- `analyze-site.md` — turn scraped pages into an SEO/UX/tech audit.
- `content-model.md` — derive page types, sections, and fields from content.
- `rebuild-spec.md` — produce a rebuild specification with acceptance criteria.
- `rewrite-copy.md` — improve page copy for clarity and conversion.
- `meta-descriptions.md` — generate titles + meta descriptions in bulk.
- `alt-text.md` — generate accessible image alt text.

Conventions:
- One prompt per file; describe **inputs**, **task**, and **output format**.
- Keep prompts client-agnostic; pass client specifics as variables.
