import { SEO } from "@/components/SEO";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";

export function NotFoundPage() {
  return (
    <>
      <SEO title="Pagina niet gevonden | BM Carservice" description="Deze pagina bestaat niet." noindex />
      <Container className="py-24 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-mark-strong">Fout 404</p>
        <h1 className="mt-3 text-4xl">Deze pagina bestaat niet</h1>
        <p className="mx-auto mt-4 max-w-md text-text-body">
          De pagina is misschien verplaatst. Ga terug naar de homepage of bekijk onze diensten.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" variant="mark">Naar de homepage</Button>
          <Button to="/diensten" variant="outline">Bekijk diensten</Button>
          <Button href={company.phone.href} variant="outline">Bel {company.phone.display}</Button>
        </div>
      </Container>
    </>
  );
}
