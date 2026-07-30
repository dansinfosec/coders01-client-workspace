import { Gift, Phone } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { breadcrumbSchema } from "@/lib/structuredData";

export function DienstenPage() {
  return (
    <>
      <SEO
        title={`Diensten — APK, onderhoud, reparatie & meer in ${company.address.city}`}
        description={`Bekijk alle diensten van ${company.name} in ${company.address.city}: APK-keuring, onderhoud, kleine en grote beurt, uitlaat- en laswerk, airco, banden, reparatie en diagnose.`}
        path="/diensten"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Diensten", path: "/diensten" },
        ])}
      />

      <PageHero
        eyebrow="Diensten"
        title="Alles voor uw auto onder één dak"
        intro="Van keuring tot reparatie — vakwerk door gediplomeerde monteurs, voor alle merken."
        crumbs={[{ label: "Home", to: "/" }, { label: "Diensten" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button to={paths.afspraak} size="lg">Afspraak maken</Button>
          <Button href={company.phone.href} variant="outlineInvert" size="lg">
            <Phone className="h-5 w-5" aria-hidden />
            {company.phone.display}
          </Button>
        </div>
      </PageHero>

      <Section tone="paper" size="lg">
        <Container>
          <ServicesGrid />
        </Container>
      </Section>

      {company.offer && (
        <Section tone="petrol" size="md">
          <Container>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Gift className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-2xs uppercase tracking-label text-white/70">Onze actie</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{company.offer.label}</h2>
                </div>
              </div>
              <Button to={paths.dienst("grote-beurt")} variant="invert" size="lg" className="shrink-0">
                Grote beurt inplannen
              </Button>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
