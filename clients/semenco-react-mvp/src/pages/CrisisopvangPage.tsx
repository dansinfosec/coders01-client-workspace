import { ServicePageTemplate } from "@/components/sections/ServicePageTemplate";
import { Section } from "@/components/sections/Section";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getServiceById, crisisFundingRoutes } from "@/data/careServices";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "@/routes/paths";

/** Crisisopvang service page (route "/crisisopvang"). Calm, professional — no urgency styling. */
export function CrisisopvangPage() {
  const service = getServiceById("crisisopvang");
  if (!service) return <NotFoundPage />;

  return (
    <ServicePageTemplate
      service={service}
      metaDescription="Tijdelijke crisisopvang (maximaal vier weken) bij Sem & Co: kleinschalig en huiselijk, met duidelijke structuur. Neem contact op om de mogelijkheden te bespreken."
      cta={{
        title: "Even overleggen over crisisopvang?",
        description:
          "Neem contact op, dan kijken we samen of crisisopvang bij Sem & Co passend en haalbaar is.",
        primaryLabel: "Neem contact op",
        primaryTo: ROUTES.contact,
        secondaryLabel: "Aanmelden",
        secondaryTo: ROUTES.aanmelden,
      }}
    >
      <Section tone="muted">
        <SectionHeading
          title="Aanmelding en verwijzing"
          description="Crisisopvang loopt via een verwijzing. Twee routes komen het meest voor:"
        />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {crisisFundingRoutes.map((route) => (
            <li key={route.id}>
              <Card className="h-full">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-text-primary">{route.name}</h3>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-strong">
                    {route.scheme}
                  </span>
                </div>
                <ol className="mt-4 space-y-2">
                  {route.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-text-secondary">
                      <span className="font-semibold text-brand">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-prose text-sm text-text-secondary">
          Weet je niet zeker welke route past? Neem gerust contact op om de
          mogelijkheden te bespreken.
        </p>
      </Section>
    </ServicePageTemplate>
  );
}
