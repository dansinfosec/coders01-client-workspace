/**
 * Reviews.
 *  - Headline rating + count come from Google Maps (4.9 / 97) — see business.ts.
 *  - No individual testimonial text is shown: the only review text previously
 *    available came from a different (booking) source and cannot be attributed to
 *    this business. Real testimonials can be added from Google with owner consent.
 *    Nothing is fabricated.
 */
export interface Review {
  author: string;
  text: string;
  timeAgo: string;
  source: string;
}

export const reviews: Review[] = [];
