import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectsGallery } from "@/components/sections/ProjectsGallery";
import { CTASection } from "@/components/sections/CTASection";

export function ProjectenPage() {
  return (
    <>
      <SEO
        title="Projecten — uitgevoerd dakwerk | All-in Daktechniek"
        description="Een greep uit onze uitgevoerde dakprojecten: platte daken, pannendaken, lood- en zinkwerk en dakisolatie door All-in Daktechniek in Honselersdijk e.o."
        path="/projecten"
      />
      <PageHero
        eyebrow="Uitgevoerd werk"
        title="Onze projecten"
        intro="Een greep uit ons uitgevoerde dakwerk. Meer voorbeelden en referenties bespreken wij graag persoonlijk."
        image="/images/all-in-daktechniek/project-plat-dak-171237.webp"
      />
      <Section>
        <ProjectsGallery />
        <p className="mt-8 max-w-prose text-sm text-text-muted">
          Wilt u referenties of meer voorbeelden van een specifiek type dak zien? Neem contact met
          ons op — wij laten u graag vergelijkbaar werk zien.
        </p>
      </Section>
      <CTASection />
    </>
  );
}
