import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";

export function DienstenPage() {
  return (
    <>
      <SEO
        title="Diensten — dakwerkzaamheden | All-in Daktechniek"
        description="Alle dakwerkzaamheden van All-in Daktechniek: platte daken, pannendaken, lood- en zinkwerk, schoorstenen, dakisolatie, EPDM en dakinspectie in Honselersdijk e.o."
        path="/diensten"
      />
      <PageHero
        eyebrow="Onze diensten"
        title="Alle dakwerkzaamheden onder één dak"
        intro="Wij verzorgen het complete dakonderhoud: van nieuwe daken tot reparaties, isolatie en inspectie."
        image="/images/all-in-daktechniek/slider-pannendaken.webp"
      />
      <Section>
        <ServicesGrid />
      </Section>
      <CTASection />
    </>
  );
}
