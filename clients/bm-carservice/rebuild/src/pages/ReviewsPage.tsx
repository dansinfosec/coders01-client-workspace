import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { ReviewsTeaser } from "@/components/sections/ReviewsTeaser";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { reviewsAggregate } from "@/data/reviews";

export function ReviewsPage() {
  return (
    <>
      <SEO
        title="Reviews & beoordelingen | BM Carservice Amstelveen"
        description="De waardering van klanten voor BM Carservice in Amstelveen — score, aantal beoordelingen en aanbevelingspercentage."
        path="/reviews"
      />
      <PageHero
        eyebrow="Waardering"
        title="Beoordelingen van onze klanten"
        intro="Automobilisten uit Amstelveen en omgeving waarderen onze service, deskundigheid en eerlijke prijzen."
        crumbs={[{ label: "Home", to: "/" }, { label: "Reviews" }]}
      />
      <Section tone="default">
        <ReviewsTeaser />
        {!reviewsAggregate.verified && (
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-text-muted">
            De individuele beoordelingen worden binnenkort rechtstreeks via ons reviewplatform
            getoond. De cijfers hierboven komen van onze huidige website; de bron wordt geverifieerd
            voordat losse reviews worden weergegeven.
          </p>
        )}
      </Section>
      <CTASection />
    </>
  );
}
