import { Phone } from "lucide-react";
import { company } from "@/data/company";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface CTASectionProps {
  title?: string;
  text?: string;
}

/** Closing call-to-action band (ink) — afspraak + bel. */
export function CTASection({
  title = "Klaar om langs te komen?",
  text = "Maak een afspraak of bel ons direct. Voor een APK hoeft u niet eens te reserveren — loop gewoon binnen.",
}: CTASectionProps) {
  return (
    <section className="bg-ink text-text-invert">
      <div aria-hidden="true" className="h-2 w-full bg-hazard" />
      <Container className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl text-text-invert sm:text-4xl">{title}</h2>
          <p className="mt-3 text-text-invert/80">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button to="/afspraak" variant="mark" size="lg">Maak een afspraak</Button>
          <Button href={company.phone.href} variant="onInk" size="lg">
            <Phone className="h-5 w-5" /> {company.phone.display}
          </Button>
        </div>
      </Container>
    </section>
  );
}
