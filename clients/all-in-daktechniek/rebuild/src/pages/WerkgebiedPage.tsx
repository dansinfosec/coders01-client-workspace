import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { ServiceAreaSection } from "@/components/sections/ServiceAreaSection";
import { CTASection } from "@/components/sections/CTASection";
import { serviceArea } from "@/data/serviceArea";

export function WerkgebiedPage() {
  return (
    <>
      <SEO
        title={`Werkgebied — dakdekker in ${serviceArea.base.city} e.o. | All-in Daktechniek`}
        description={`All-in Daktechniek is gevestigd in ${serviceArea.base.city} (${serviceArea.base.municipality}) en werkt in de omgeving. Bel of app om te vragen of wij bij u werken.`}
        path="/werkgebied"
      />
      <PageHero
        eyebrow="Werkgebied"
        title={`Dakdekker in ${serviceArea.base.city} en omgeving`}
        intro="Wij werken vanuit Honselersdijk in de directe omgeving. Vraag gerust of wij bij u in de buurt werken."
        image="/images/all-in-daktechniek/slider-schoorstenen.webp"
      />
      <Section>
        <ServiceAreaSection />
      </Section>
      <CTASection />
    </>
  );
}
