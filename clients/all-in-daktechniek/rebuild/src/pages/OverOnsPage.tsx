import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { AboutSection } from "@/components/sections/AboutSection";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CTASection } from "@/components/sections/CTASection";

export function OverOnsPage() {
  return (
    <>
      <SEO
        title="Over ons — ervaren dakdekkers | All-in Daktechniek"
        description="All-in Daktechniek is een team van zes ervaren dakdekkers, VCA-gecertificeerd, gevestigd in Honselersdijk. Kwalitatief en duurzaam dakwerk met garantie."
        path="/over-ons"
      />
      <PageHero
        eyebrow="Over All-in Daktechniek"
        title="Ervaren specialisten in dakbedekking"
        intro="Een hecht team van vakmensen dat staat voor kwalitatief en duurzaam dakwerk."
        image="/images/all-in-daktechniek/slider-dakisolatie.webp"
      />
      <TrustStrip />
      <Section>
        <AboutSection />
      </Section>
      <CTASection />
    </>
  );
}
