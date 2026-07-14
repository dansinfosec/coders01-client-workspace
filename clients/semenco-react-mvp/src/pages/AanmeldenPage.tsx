import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { ApplicationForm } from "@/components/forms/ApplicationForm";

/** Aanmelden page (route "/aanmelden") — hosts the multistep application form. */
export function AanmeldenPage() {
  return (
    <>
      <SEO
        title="Aanmelden"
        description="Doe een aanvraag bij Sem & Co via het aanmeldformulier. (Demo — nog geen echte verzending.)"
      />
      <PageHero
        eyebrow="Aanmelden"
        title="Aanvraag doen"
        subtitle="Vul het formulier in enkele stappen in. Je gegevens blijven bewaard terwijl je door de stappen navigeert."
        breadcrumbs={[{ label: "Aanmelden" }]}
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <ApplicationForm />
        </div>
      </Section>
    </>
  );
}
