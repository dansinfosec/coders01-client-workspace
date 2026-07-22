import { Star, ExternalLink, Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { business } from "@/data/business";
import { reviews } from "@/data/reviews";

export function Reviews() {
  return (
    <Section id="reviews" ariaLabel="Reviews">
      <div className="grid gap-10 lg:grid-cols-[auto,1fr] lg:items-center">
        {/* Rating summary — Google */}
        <div className="rounded-2xl border border-line bg-surface-muted p-8 text-center">
          <p className="font-serif text-6xl font-bold text-cream">{business.rating.toFixed(1)}</p>
          <div className="mt-2 flex justify-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-cream text-cream" />
            ))}
          </div>
          <p className="mt-3 text-sm text-text-body">
            Gebaseerd op <strong className="text-text-strong">{business.reviewCount}</strong> Google-reviews
          </p>
          <Button
            href={business.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
            className="mt-5"
          >
            Bekijk op Google <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Real review text */}
        <div>
          <SectionHeading eyebrow="Reviews" title="Wat klanten zeggen" />
          <ul className="mt-8 space-y-4">
            {reviews.map((r) => (
              <li key={r.author} className="rounded-2xl border border-line bg-ink p-6 shadow-soft">
                <Quote className="h-6 w-6 text-red" aria-hidden="true" />
                <p className="mt-3 text-lg text-text-strong">{r.text}</p>
                <p className="mt-4 text-sm text-text-muted">
                  — {r.author}, {r.timeAgo}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-text-muted">
            Beoordeling en aantal reviews via Google Maps. Reviewtekst afkomstig van de openbare
            online agenda. Er worden geen reviews verzonnen.
          </p>
        </div>
      </div>
    </Section>
  );
}
