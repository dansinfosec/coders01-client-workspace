/** Format an ISO date string as a readable Dutch date, e.g. "6 januari 2025". */
export function formatDate(iso: string, locale = "nl-NL"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
