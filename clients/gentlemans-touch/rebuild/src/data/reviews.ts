/**
 * Reviews.
 *  - Headline rating + count: Google Maps (4.9 / 97 reviews) — see business.ts.
 *  - Review TEXT below is REAL, taken verbatim from the Setmore booking page's
 *    public reviews. Nothing is fabricated. The "😎"-only review is omitted as it
 *    has no readable content. If more/newer testimonials are wanted, pull them
 *    from Google with owner consent.
 */
export interface Review {
  author: string;
  text: string;
  timeAgo: string;
  source: string;
}

export const reviews: Review[] = [
  {
    author: "Cinderella",
    text: "Super goede kapper, neemt de tijd en maakt het gemakkelijk voor kinderen 👍",
    timeAgo: "3 jaar geleden",
    source: "Setmore",
  },
];
