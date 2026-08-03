/**
 * Reviews.
 *
 * The verified Google listing returned NO rating and NO reviews, so there is
 * nothing to show and nothing is invented. When the owner gathers real Google
 * reviews (with consent) they can be added here verbatim with author + source,
 * and business.rating / business.reviewCount can be filled in. Until then the
 * Reviews section is intentionally omitted from the page.
 */
export interface Review {
  author: string;
  text: string;
  timeAgo: string;
  source: string;
}

export const reviews: Review[] = [];

/** Whether any verified review data exists to display. */
export const hasReviews = reviews.length > 0;
