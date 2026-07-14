/**
 * Lead submission architecture.
 *
 * The UI (quote form + AI assistant) submits leads through a `LeadSubmissionAdapter`
 * so the transport can change without touching the UI. The current demo uses
 * `LocalDemoAdapter` (no network, no cost). Future adapters (Django REST, n8n
 * webhook, email, CRM, WhatsApp workflow) implement the same interface.
 *
 * IMPORTANT: never call an LLM/OpenAI directly from the browser and never put an
 * API key in this frontend. All AI + delivery happens server-side later.
 */

export type LeadSource = "quote-form" | "assistant";

export interface LeadPayload {
  source: LeadSource;
  /** Flat key/value map of the collected answers (Dutch labels). */
  fields: Record<string, string | boolean | string[] | undefined>;
  /** File metadata only (names/sizes) — files themselves are NOT sent in the demo. */
  attachments?: { name: string; size: number; type: string }[];
  submittedAt: string;
  consent: boolean;
}

export interface LeadResult {
  ok: boolean;
  /** Local reference id for the demo confirmation screen. */
  reference: string;
  message?: string;
}

export interface LeadSubmissionAdapter {
  readonly id: string;
  submit(payload: LeadPayload): Promise<LeadResult>;
}

function reference(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RC-${stamp}-${rnd}`;
}

/**
 * Demo adapter: validates shape, simulates latency, returns a local reference.
 * Does NOT send an email or hit any backend — the UI must reflect this honestly.
 */
export class LocalDemoAdapter implements LeadSubmissionAdapter {
  readonly id = "local-demo";
  async submit(payload: LeadPayload): Promise<LeadResult> {
    await new Promise((r) => setTimeout(r, 650));
    if (!payload.consent) {
      return { ok: false, reference: "", message: "Toestemming ontbreekt." };
    }
    // In dev you can inspect the payload; no data leaves the browser.
    if (import.meta.env.DEV) console.info("[LocalDemoAdapter] lead (demo, not sent):", payload);
    return { ok: true, reference: reference() };
  }
}

/*
  // --- Future adapters (prepared, not active) ---
  // Django REST API:
  //   POST `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_LEAD_ENDPOINT}`
  // n8n webhook:
  //   POST `${import.meta.env.VITE_N8N_WEBHOOK_URL}`
  // Email / CRM / WhatsApp: handled server-side behind the API.
  // OpenAI: ONLY server-side, never from the browser.
*/

/** Active adapter for the current build. Swap here when a backend is connected. */
export const leadAdapter: LeadSubmissionAdapter = new LocalDemoAdapter();
