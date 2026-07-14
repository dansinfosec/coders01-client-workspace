import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { CTASection } from "@/components/sections/CTASection";
import { ProjectGallery } from "@/components/gallery/ProjectGallery";
import { Button } from "@/components/ui/Button";
import { projects } from "@/data/projects";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

export function ProjectenPage() {
  return (
    <>
      <SEO
        title="Projecten — platte daken"
        description="Bekijk uitgevoerde projecten van Roofing Center: afgewerkte platte daken, werk tijdens uitvoering en dakinspecties. Alle foto's zijn van eigen projecten."
        path={ROUTES.projecten}
      />
      <PageHero
        eyebrow="Projecten"
        title="Ons werk op platte daken"
        subtitle="Een selectie van uitgevoerde projecten. De foto's zijn van eigen werk; we tonen geen adressen of klantnamen."
        actions={<Button to={ROUTES.offerte}>{company.cta.quote}</Button>}
      />

      <Section>
        <ProjectGallery items={projects} showFilters />
      </Section>

      <CTASection
        eyebrow="Uw dak ook?"
        title="Benieuwd wat we voor uw dak kunnen doen?"
        description="Vraag een vrijblijvende inspectie of offerte aan. We denken graag met u mee."
      />
    </>
  );
}
