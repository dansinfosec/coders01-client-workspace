import { CalendarCheck, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/data/business";

export function Booking() {
  return (
    <section id="boeken" aria-label="Afspraak boeken" className="bg-ink">
      <Container className="py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-muted px-6 py-14 text-center sm:px-12">
          <div className="barber-rule absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
          <p className="eyebrow justify-center">Online afspraak</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl sm:text-4xl">
            Boek uw afspraak bij Two in one barberstudio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-body">
            Kies uw behandeling en tijdstip in de online agenda. Snel, eenvoudig en op elk moment
            van de dag.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={business.booking.base} target="_blank" rel="noopener noreferrer" size="lg">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Boek afspraak
            </Button>
            <Button href={business.phone.href} variant="outline" size="lg">
              <Phone className="h-5 w-5" aria-hidden="true" /> Bel {business.phone.display}
            </Button>
          </div>
          <p className="mt-6 text-xs text-text-muted">De online agenda opent in een nieuw tabblad.</p>
        </div>
      </Container>
    </section>
  );
}
