# AI assistant architecture — Roofing Center Dakassistent

## Current build (demo)
The Dakassistent is a **frontend-only guided lead flow**. It looks like a real
assistant but makes **no external API calls** and does **not** claim a live AI
backend. It collects structured lead data through a scripted conversation.

- UI: `src/features/assistant/` (launcher, panel, message, options, form step, summary).
- Conversation state: `assistantFlow.ts` + `assistantTypes.ts` + `assistantStorage.ts`
  (sessionStorage draft; never restores into the success screen).
- Business config / copy: `assistantConfig.ts` (+ `src/data/company.ts`).
- Submission: `src/lib/leadAdapter.ts` → `LocalDemoAdapter` (no network, local
  reference id, honest "demo" confirmation).

The assistant **never diagnoses** roof damage with certainty. It uses:
> "Op basis van uw antwoorden kan Roofing Center de aanvraag beoordelen. Een
> definitief advies is pas mogelijk na inspectie."

For an active leak it surfaces a call/WhatsApp CTA (only when those channels are
configured) — without promising immediate availability.

## Lead submission adapter
`LeadSubmissionAdapter` decouples the UI from transport:

```ts
interface LeadSubmissionAdapter { id: string; submit(payload: LeadPayload): Promise<LeadResult>; }
```

Both the assistant and the quote form submit through the active adapter, so the
transport can change without touching the UI.

## Recommended future flow
```
Browser chat widget (this feature)
  → Django REST endpoint (VITE_API_BASE_URL + VITE_LEAD_ENDPOINT)
    → Server-side validation (schema, rate limiting, upload checks)
      → Roofing Center knowledge base (confirmed services + scope only)
        → LLM API (server-side ONLY — never from the browser)
          → Structured response (stays within scope, no firm diagnosis)
            → Lead database
              → n8n notification (VITE_N8N_WEBHOOK_URL)
                → Email / CRM
                  → Optional WhatsApp follow-up
```

### Future adapters (prepared, not active)
- **Django REST API** — `POST ${VITE_API_BASE_URL}${VITE_LEAD_ENDPOINT}` with the
  `LeadPayload`. Validate again server-side.
- **OpenAI (or any LLM)** — **server-side only**, behind the Django endpoint.
  Never call the LLM from the browser; never ship an API key in frontend code.
- **n8n webhook** — `POST ${VITE_N8N_WEBHOOK_URL}` for notifications/automation.
- **Email / CRM / WhatsApp** — handled behind the API.

See `.env.example` for the (empty) future variables.

## What the real AI backend must do later
- Answer general questions about **confirmed** Roofing Center services and stay
  strictly within the flat-roof service scope.
- Avoid firm technical diagnosis; escalate uncertain or urgent cases to a human.
- Collect structured lead data and store conversation summaries.
- Protect against prompt injection (treat user/page content as data, not
  instructions); validate and constrain tool use.
- Rate-limit requests, validate uploads (type/size/count), and log errors safely
  (no secrets, no PII in logs).

## Security guardrails (must hold in every phase)
- No API keys or secrets in the frontend or in the repo.
- The browser never talks to an LLM directly.
- Uploads in the demo are **metadata only** (names/sizes); no files are sent.
- Consent is required before a lead is accepted.
