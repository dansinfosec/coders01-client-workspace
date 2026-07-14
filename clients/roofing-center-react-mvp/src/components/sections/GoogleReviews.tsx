import { Star, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { company, contact } from "@/data/company";

/**
 * Google Reviews section.
 * - NO reviews, names, quotes or star counts are invented.
 * - When a Google profile URL is configured, a CTA links to it.
 * - Otherwise a clearly-labelled placeholder is shown, prepared for a future
 *   Google Places integration.
 */
export function GoogleReviews() {
  return (
    <Card className="border-dashed">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-cream" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <h3 className="mt-2 text-lg font-bold text-text-strong">Google-beoordelingen</h3>
          <p className="mt-1 max-w-prose text-sm text-text-muted">
            {contact.hasReviews
              ? "Lees wat klanten van Roofing Center vinden op Google."
              : "Deze sectie is voorbereid op een koppeling met Google-beoordelingen. Er worden geen beoordelingen getoond die niet echt zijn."}
          </p>
          {!contact.hasReviews && (
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              Demo · nog te koppelen met het Google-bedrijfsprofiel
            </p>
          )}
        </div>
        {contact.hasReviews && (
          <Button href={company.googleReviewsUrl} target="_blank" rel="noopener noreferrer" variant="outlineNavy">
            Bekijk op Google
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </Card>
  );
}
