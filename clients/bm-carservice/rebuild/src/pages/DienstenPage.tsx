import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { services } from "@/data/services";

export function DienstenPage() {
  return (
    <>
      <SEO
        title="Diensten — APK, onderhoud, banden & reparatie | BM Carservice"
        description="Alle diensten van BM Carservice Amstelveen: APK, onderhoud, banden, reparatie, distributieketting, airco, accu, uitlaat, remmen, koppeling en storingsdiagnose."
        path="/diensten"
      />
      <PageHero
        eyebrow="Diensten"
        title="Alles voor uw auto onder één dak"
        intro="Voor alle merken, met A-kwaliteit onderdelen en eerlijke prijzen. Kies een dienst voor meer informatie."
        crumbs={[{ label: "Home", to: "/" }, { label: "Diensten" }]}
      />
      <Section tone="default">
        <ServicesGrid items={services} />
      </Section>
      <CTASection />
    </>
  );
}
