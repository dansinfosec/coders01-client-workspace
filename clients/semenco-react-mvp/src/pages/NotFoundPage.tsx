import { SEO } from "@/components/SEO";
import { Section } from "@/components/sections/Section";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/paths";

/** 404 page (route "*"). Not indexed. */
export function NotFoundPage() {
  return (
    <>
      <SEO
        title="Pagina niet gevonden"
        description="De opgevraagde pagina bestaat niet."
        noIndex
      />
      <Section spacing="lg">
        <div className="mx-auto max-w-prose text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">404</p>
          <h1 className="mt-2 text-3xl sm:text-4xl text-text-primary">
            Deze pagina bestaat niet
          </h1>
          <p className="mt-4 text-text-secondary">
            De pagina die je zoekt is verplaatst of bestaat niet meer.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to={ROUTES.home}>Naar de homepage</Button>
            <Button to={ROUTES.contact} variant="secondary">
              Contact
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
