import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { CTASection } from "@/components/sections/CTASection";
import { FaqList } from "@/components/sections/FaqList";
import { faqs } from "@/data/faqs";
import { ROUTES } from "@/routes/paths";

export function FaqPage() {
  return (
    <>
      <SEO
        title="Veelgestelde vragen"
        description="Antwoorden op veelgestelde vragen over platte daken: bitumen en EPDM, lekkage, inspectie, renovatie en de werkwijze van Roofing Center."
        path={ROUTES.faq}
      />
      <PageHero eyebrow="Veelgestelde vragen" title="Veelgestelde vragen" subtitle="Antwoorden op vragen die vaak terugkomen over platte daken." />
      <Section>
        <FaqList items={faqs} />
      </Section>
      <CTASection eyebrow="Nog een vraag?" title="Staat uw vraag er niet bij?" description="Stel uw vraag via de dakassistent of vraag direct een inspectie of offerte aan." />
    </>
  );
}
