/**
 * Estimate reading time in minutes from an array of paragraphs.
 * Uses ~200 words/minute; always at least 1 minute.
 */
export function estimateReadingTime(paragraphs: string[], wordsPerMinute = 200): number {
  const words = paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}
