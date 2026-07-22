import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business, BOOK_LABEL } from "@/data/business";

export function Booking() {
  return (
    <section id="boeken" aria-label="Afspraak maken" className="bg-ink">
      <Container className="py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-muted px-6 py-14 text-center sm:px-12">
          <div className="barber-rule absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
          <p className="eyebrow justify-center">Afspraak maken</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl sm:text-4xl">
            Maak een afspraak bij Gentleman&rsquo;s Touch
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-body">
            Online boeken is binnenkort beschikbaar. Bel ons in de tussentijd om uw afspraak in te
            plannen — wij helpen u graag verder.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={business.phone.href} size="lg">
              <Phone className="h-5 w-5" aria-hidden="true" /> {BOOK_LABEL}
            </Button>
            <Button href={business.phone.href} variant="outline" size="lg">
              <Phone className="h-5 w-5" aria-hidden="true" /> Bel {business.phone.display}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
