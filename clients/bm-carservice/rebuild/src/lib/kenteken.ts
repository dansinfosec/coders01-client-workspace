/** Dutch licence-plate helpers: normalise, format by sidecode, and date formatting. */

/** Strip to A–Z/0–9, uppercase, max 8 chars (search value — no spaces/dashes). */
export function normalizeKenteken(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

// Segment lengths per NL sidecode, keyed by the 6-char letter(L)/digit(D) signature.
const SIDECODES: Record<string, number[]> = {
  LLDDDD: [2, 2, 2], // XX-99-99
  DDDDLL: [2, 2, 2], // 99-99-XX
  DDLLDD: [2, 2, 2], // 99-XX-99
  LLDDLL: [2, 2, 2], // XX-99-XX
  LLLLDD: [2, 2, 2], // XX-XX-99
  DDLLLL: [2, 2, 2], // 99-XX-XX
  DDLLLD: [2, 3, 1], // 99-XXX-9
  DLLLDD: [1, 3, 2], // 9-XXX-99
  LLDDDL: [2, 3, 1], // XX-999-X
  LDDDLL: [1, 3, 2], // X-999-XX
  LLLDDL: [3, 2, 1], // XXX-99-X
  LDDLLL: [1, 2, 3], // X-99-XXX
  DLLDDD: [1, 2, 3], // 9-XX-999
  DDDLLD: [3, 2, 1], // 999-XX-9
};

const signature = (s: string) =>
  s.replace(/[A-Z]/g, "L").replace(/[0-9]/g, "D");

/** Format a plate with NL dashes (e.g. "GG123D" → "GG-123-D"). Unknown patterns: as-is. */
export function formatKenteken(input: string): string {
  const k = normalizeKenteken(input);
  if (k.length !== 6) return k;
  const segments = SIDECODES[signature(k)];
  if (!segments) return k;
  const parts: string[] = [];
  let i = 0;
  for (const len of segments) {
    parts.push(k.slice(i, i + len));
    i += len;
  }
  return parts.join("-");
}

/** A plausible 6-char NL plate (used to trigger auto-lookup; RDW is the real check). */
export function looksComplete(input: string): boolean {
  const k = normalizeKenteken(input);
  return k.length === 6 && signature(k) in SIDECODES;
}

/** "20270710" (YYYYMMDD) → "10-07-2027". Empty/invalid → "". */
export function formatApkDate(raw: string | undefined): string {
  if (!raw) return "";
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(raw.trim());
  if (!m) {
    // Some datasets return ISO (…T00:00:00.000)
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
    if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
    return "";
  }
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Group a digit string with thousands dots (e.g. "123456" → "123.456"). */
export function formatKm(digits: string): string {
  const d = digits.replace(/\D/g, "");
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
