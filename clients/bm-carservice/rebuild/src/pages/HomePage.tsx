import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { UspList } from "@/components/sections/UspList";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { ServiceAreaSection } from "@/components/sections/ServiceAreaSection";
import { GarageShowcase } from "@/components/sections/GarageShowcase";
import { ReviewsTeaser } from "@/components/sections/ReviewsTeaser";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { featuredServices } from "@/data/services";

export function HomePage() {
  return (
    <>
      <SEO
        title="BM Carservice — APK zonder afspraak & autogarage in Amstelveen"
        description="Autogarage in Amstelveen voor APK zonder afspraak, onderhoud, banden en reparatie. RDW-gecertificeerd en ANWB-partnerbedrijf. Klaar terwijl u wacht, alle merken."
        path="/"
      />

      <Hero />
      <TrustStrip />

      {/* APK highlight — the headline advantage */}
      <Section tone="default">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Tag tone="signal">Onze specialiteit</Tag>
            <h2 className="mt-4 text-3xl sm:text-4xl">APK zonder afspraak — klaar terwijl u wacht</h2>
            <p className="mt-4 text-lg text-text-body">
              Geen wachtlijst, geen gedoe. Loop binnen voor een RDW-erkende APK tegen een vast
              tarief van €44,95 (benzine) of €64,95 (diesel). Reparaties overleggen we altijd eerst.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/apk-zonder-afspraak" variant="mark">Alles over de APK</Button>
              <Button to="/afspraak" variant="outline">Toch liever op afspraak?</Button>
            </div>
          </div>
          <UspList className="rounded-2xl border border-line bg-surface-muted p-6" />
        </div>
      </Section>

      {/* Services */}
      <Section tone="muted">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Diensten"
            title="Alles voor uw auto onder één dak"
            intro="Van APK en onderhoud tot distributieketting, banden en storingsdiagnose — voor alle merken."
          />
          <Link to="/diensten" className="inline-flex items-center gap-1.5 font-semibold text-mark-strong">
            Bekijk alle diensten <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10">
          <ServicesGrid items={featuredServices} />
        </div>
      </Section>

      {/* Garage showcase */}
      <Section tone="default">
        <GarageShowcase />
      </Section>

      {/* Opening hours + service area */}
      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <ServiceAreaSection />
          <OpeningHours />
        </div>
      </Section>

      {/* Reviews */}
      <Section tone="default" spacing="md">
        <SectionHeading
          eyebrow="Waardering"
          title="Wat klanten van ons vinden"
          align="center"
          className="mb-10"
        />
        <ReviewsTeaser />
      </Section>

      <CTASection />
    </>
  );
}
