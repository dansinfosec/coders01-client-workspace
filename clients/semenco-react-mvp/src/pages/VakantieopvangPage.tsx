import { ServicePageTemplate } from "@/components/sections/ServicePageTemplate";
import { Section } from "@/components/sections/Section";
import { getServiceById } from "@/data/careServices";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "@/routes/paths";

/** Vakantieopvang service page (route "/vakantieopvang"). */
export function VakantieopvangPage() {
  const service = getServiceById("vakantieopvang");
  if (!service) return <NotFoundPage />;

  return (
    <ServicePageTemplate
      service={service}
      metaDescription="Vakantieweken bij Sem & Co met een rustig ritme, structuur en aandacht — ruimte voor plezier én voor herstelmomenten."
      cta={{
        title: "Vakantie met rust en aandacht?",
        description: "Neem contact op om de mogelijkheden voor een vakantieweek te bespreken.",
        primaryLabel: "Aanmelden",
        primaryTo: ROUTES.aanmelden,
        secondaryLabel: "Neem contact op",
        secondaryTo: ROUTES.contact,
      }}
    >
      <Section tone="muted" spacing="md">
        <p className="max-w-prose text-sm text-text-secondary">
          Beschikbaarheid en exacte data van vakantieweken worden per periode
          afgestemd. Neem contact op voor de actuele mogelijkheden.
        </p>
      </Section>
    </ServicePageTemplate>
  );
}
