/**
 * Nederlandse kenteken-helpers: normaliseren, formatteren (sidecodes) en valideren.
 * Puur frontend — geen RDW-call hier (die zit in services/rdwService).
 */

/** Strip tot A–Z0–9, uppercase, max 6 tekens. */
export function normalizeKenteken(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

const D = "D";
const L = "L";
const sig = (s: string) =>
  s
    .split("")
    .map((c) => (/[0-9]/.test(c) ? D : L))
    .join("");

// Signature → segmentlengtes (RDW-sidecodes 1–14).
const SEGMENTS: Record<string, number[]> = {
  [L + L + D + D + D + D]: [2, 2, 2], // XX-99-99
  [D + D + D + D + L + L]: [2, 2, 2], // 99-99-XX
  [D + D + L + L + D + D]: [2, 2, 2], // 99-XX-99
  [L + L + D + D + L + L]: [2, 2, 2], // XX-99-XX
  [L + L + L + L + D + D]: [2, 2, 2], // XX-XX-99
  [D + D + L + L + L + L]: [2, 2, 2], // 99-XX-XX
  [D + D + L + L + L + D]: [2, 3, 1], // 99-XXX-9
  [D + L + L + L + D + D]: [1, 3, 2], // 9-XXX-99
  [L + L + D + D + D + L]: [2, 3, 1], // XX-999-X
  [L + D + D + D + L + L]: [1, 3, 2], // X-999-XX
  [L + L + L + D + D + L]: [3, 2, 1], // XXX-99-X
  [L + D + D + L + L + L]: [1, 2, 3], // X-99-XXX
  [D + L + L + D + D + D]: [1, 2, 3], // 9-XX-999
  [D + D + D + L + L + D]: [3, 2, 1], // 999-XX-9
};

/** Formatteer met streepjes zodra een geldige sidecode herkend wordt; anders rauwe uppercase. */
export function formatKenteken(raw: string): string {
  const k = normalizeKenteken(raw);
  if (k.length !== 6) return k;
  const segments = SEGMENTS[sig(k)];
  if (!segments) return k;
  const parts: string[] = [];
  let i = 0;
  for (const len of segments) {
    parts.push(k.slice(i, i + len));
    i += len;
  }
  return parts.join("-");
}

/** Een geldig NL-kenteken heeft 6 alfanumerieke tekens en matcht een bekende sidecode. */
export function isValidKenteken(raw: string): boolean {
  const k = normalizeKenteken(raw);
  return k.length === 6 && Boolean(SEGMENTS[sig(k)]);
}
