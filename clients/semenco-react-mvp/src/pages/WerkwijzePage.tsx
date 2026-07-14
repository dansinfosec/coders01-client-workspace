import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { CallToAction } from "@/components/sections/CallToAction";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { ROUTES } from "@/routes/paths";

/** "Werkwijze" page (route "/werkwijze"). Verified 6-step intake journey. */
export function WerkwijzePage() {
  return (
    <>
      <SEO
        title="Werkwijze"
        description="Van aanmelden tot proeflogeren: zo ziet het kennismakings- en intaketraject bij Sem & Co eruit. Aanmelden is vrijblijvend."
      />
      <PageHero
        eyebrow="Zo werkt het"
        title="Onze werkwijze"
        subtitle="Aanmelden is een eerste stap en volledig vrijblijvend. We nemen de tijd om jullie goed te leren kennen, zodat het echt past — altijd op het tempo van het kind."
        breadcrumbs={[{ label: "Werkwijze" }]}
      />

      <Section>
        <SectionHeading
          title="In zes stappen"
          description="Wat je als ouder of verwijzer kunt verwachten, van eerste contact tot een rustige start."
        />
        <div className="mt-10 max-w-3xl">
          <ProcessTimeline />
        </div>
      </Section>

      <CallToAction
        content={{
          title: "Klaar voor de eerste stap?",
          description: "Aanmelden is vrijblijvend. We kijken samen, rustig en zorgvuldig, wat past.",
          primaryLabel: "Aanmelden",
          primaryTo: ROUTES.aanmelden,
          secondaryLabel: "Neem contact op",
          secondaryTo: ROUTES.contact,
        }}
      />
    </>
  );
}
