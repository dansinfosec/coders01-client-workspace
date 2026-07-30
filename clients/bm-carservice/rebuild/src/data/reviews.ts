/**
 * Aggregate review figures as shown on the current live site.
 *
 * IMPORTANT — data integrity: the SOURCE/platform of these numbers is NOT verified.
 * Per the client decision we DISPLAY the aggregate as-is (it is the client's own published
 * figure), clearly framed as coming from the existing website, but we do NOT:
 *   - invent or reproduce individual review quotes (none are verifiable), or
 *   - emit AggregateRating in JSON-LD structured data.
 * TODO: verify the review source (platform, date, link) with the client, then wire up a real
 * review integration and, if legitimate, AggregateRating.
 */
export const reviewsAggregate = {
  score: "9,1",
  scoreMax: 10,
  count: 345,
  recommendPercent: 89,
  /** Human note rendered near the figures for honesty. */
  sourceNote: "Cijfers zoals vermeld op de huidige website. Bron wordt geverifieerd.",
  verified: false,
} as const;
