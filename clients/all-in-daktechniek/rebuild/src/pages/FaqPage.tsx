import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { FaqList } from "@/components/sections/FaqList";
import { CTASection } from "@/components/sections/CTASection";
import { faqs } from "@/data/faqs";

export function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <SEO
        title="Veelgestelde vragen | All-in Daktechniek"
        description="Antwoorden op veelgestelde vragen over dakwerkzaamheden, kosteloze inspectie, garantie en contact met All-in Daktechniek."
        path="/veelgestelde-vragen"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <PageHero
        eyebrow="Vragen?"
        title="Veelgestelde vragen"
        intro="Staat uw vraag er niet bij? Bel, app of mail ons — wij helpen u graag verder."
      />
      <Section>
        <FaqList />
      </Section>
      <CTASection />
    </>
  );
}
