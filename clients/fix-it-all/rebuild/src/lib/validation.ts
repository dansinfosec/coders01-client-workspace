/** Kleine, herbruikbare validators voor formulieren (frontend). */

/** Nederlands telefoonnummer: accepteert 06…, 0xx…, +31… en spaties/streepjes. */
export function isValidPhoneNL(raw: string): boolean {
  const v = raw.replace(/[\s-]/g, "");
  return /^(?:\+31|0)[1-9][0-9]{7,9}$/.test(v);
}

export function isValidEmail(raw: string): boolean {
  const v = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** Nederlandse postcode: 1234 AB (spatie optioneel). */
export function isValidPostcodeNL(raw: string): boolean {
  return /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test(raw.trim());
}
