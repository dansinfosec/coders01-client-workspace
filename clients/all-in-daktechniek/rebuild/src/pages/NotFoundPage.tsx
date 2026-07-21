import { SEO } from "@/components/SEO";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/paths";

export function NotFoundPage() {
  return (
    <>
      <SEO title="Pagina niet gevonden | All-in Daktechniek" description="Deze pagina bestaat niet." path="/404" />
      <Container className="py-24 text-center sm:py-32">
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Pagina niet gevonden</h1>
        <p className="mx-auto mt-4 max-w-prose text-text-body">
          De pagina die u zoekt bestaat niet of is verplaatst.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button to={ROUTES.home}>Naar de homepage</Button>
          <Button to={ROUTES.diensten} variant="outline">Bekijk diensten</Button>
        </div>
      </Container>
    </>
  );
}
