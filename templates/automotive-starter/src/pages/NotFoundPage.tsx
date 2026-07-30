import { SEO } from "@/components/SEO";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { paths } from "@/routes/paths";

export function NotFoundPage() {
  return (
    <>
      <SEO title="Pagina niet gevonden" noindex />
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">Fout 404</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Deze pagina bestaat niet</h1>
        <p className="mt-4 max-w-md text-text-muted">
          Mogelijk is de pagina verplaatst of verwijderd. Ga terug naar de homepage of bekijk onze diensten.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to={paths.home}>Naar de homepage</Button>
          <Button to={paths.diensten} variant="outline">
            Bekijk diensten
          </Button>
        </div>
      </Container>
    </>
  );
}
