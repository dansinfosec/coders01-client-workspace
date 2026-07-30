import { Star } from "lucide-react";
import { reviewsAggregate } from "@/data/reviews";
import { Button } from "@/components/ui/Button";

/**
 * Aggregate review figures as published on the client's own site.
 * Honest framing (source note), no invented quotes, no JSON-LD rating — see data/reviews.ts.
 */
export function ReviewsTeaser() {
  const { score, scoreMax, count, recommendPercent, sourceNote } = reviewsAggregate;
  return (
    <div className="grid gap-8 rounded-2xl border border-line bg-surface p-8 shadow-soft sm:grid-cols-3 sm:items-center">
      <div className="text-center sm:border-r sm:border-line">
        <div className="flex items-center justify-center gap-1.5">
          <Star className="h-6 w-6 fill-signal text-signal" />
          <span className="font-display text-4xl font-extrabold text-text-strong">{score}</span>
          <span className="text-text-muted">/ {scoreMax}</span>
        </div>
        <p className="mt-1 text-sm text-text-muted">{count} beoordelingen</p>
      </div>
      <div className="text-center">
        <span className="font-display text-4xl font-extrabold text-text-strong">{recommendPercent}%</span>
        <p className="mt-1 text-sm text-text-muted">beveelt BM Carservice aan</p>
      </div>
      <div className="text-center sm:text-left">
        <Button to="/reviews" variant="outline" size="sm">Lees de reviews</Button>
        <p className="mt-3 text-xs text-text-muted">{sourceNote}</p>
      </div>
    </div>
  );
}
