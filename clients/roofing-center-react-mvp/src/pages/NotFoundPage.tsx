import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/paths";

export function NotFoundPage() {
  return (
    <>
      <SEO title="Pagina niet gevonden" description="De opgevraagde pagina bestaat niet." noIndex />
      <Section spacing="lg">
        <div className="mx-auto max-w-prose text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-strong">404</p>
          <h1 className="mt-2 text-3xl font-bold text-text-strong sm:text-4xl">Deze pagina bestaat niet</h1>
          <p className="mt-4 text-text-muted">De pagina die u zoekt is verplaatst of bestaat niet meer.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to={ROUTES.home}>Naar de homepage</Button>
            <Button to={ROUTES.contact} variant="outlineNavy">Contact</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
