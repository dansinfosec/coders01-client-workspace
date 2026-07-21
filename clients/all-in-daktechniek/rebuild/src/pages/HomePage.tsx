import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProjectsGallery } from "@/components/sections/ProjectsGallery";
import { ServiceAreaSection } from "@/components/sections/ServiceAreaSection";
import { CTASection } from "@/components/sections/CTASection";
import { ROUTES } from "@/routes/paths";

export function HomePage() {
  return (
    <>
      <SEO
        title="All-in Daktechniek — Dakdekker in Honselersdijk & het Westland"
        description="All-in Daktechniek is uw dakdekker in Honselersdijk en omgeving: platte daken, pannendaken, lood- en zinkwerk, schoorstenen, dakisolatie en EPDM. Vraag vrijblijvend een offerte aan."
        path="/"
      />
      <Hero />
      <TrustStrip />

      <Section ariaLabel="Diensten">
        <SectionHeading
          eyebrow="Onze diensten"
          title="Alle dakwerkzaamheden onder één dak"
          intro="Van een compleet nieuw dak tot een snelle reparatie: bekijk waar wij u mee kunnen helpen."
        />
        <div className="mt-10">
          <ServicesGrid />
        </div>
      </Section>

      <Section tone="muted" ariaLabel="Over ons">
        <AboutSection />
      </Section>

      <Section ariaLabel="Projecten">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Uitgevoerd werk"
            title="Recente projecten"
            intro="Een greep uit onze uitgevoerde dakprojecten."
          />
          <Button to={ROUTES.projecten} variant="outline">
            Alle projecten
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-10">
          <ProjectsGallery limit={6} />
        </div>
      </Section>

      <Section tone="muted" ariaLabel="Werkgebied">
        <ServiceAreaSection />
      </Section>

      <Section ariaLabel="Veelgestelde vragen" spacing="md">
        <div className="mx-auto max-w-prose text-center">
          <SectionHeading
            align="center"
            eyebrow="Vragen?"
            title="Veelgestelde vragen"
            intro="Staat uw vraag er niet bij? Neem gerust contact met ons op."
          />
          <div className="mt-6">
            <Link
              to={ROUTES.faq}
              className="inline-flex items-center gap-1.5 font-semibold text-green-strong hover:underline"
            >
              Bekijk alle veelgestelde vragen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
