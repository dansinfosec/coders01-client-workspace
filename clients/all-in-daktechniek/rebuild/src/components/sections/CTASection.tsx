import { Phone, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

interface CTASectionProps {
  title?: string;
  text?: string;
}

/** Reusable ink CTA band: offerte + call + WhatsApp. */
export function CTASection({
  title = "Klaar voor een betrouwbaar dak?",
  text = "Vraag vrijblijvend een offerte aan of plan een kosteloze dakinspectie. Wij denken graag met u mee.",
}: CTASectionProps) {
  return (
    <section className="bg-ink text-text-invert">
      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl text-text-invert sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-text-invert/80">{text}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button to={ROUTES.offerte} size="lg">
              {company.cta.quote}
            </Button>
            <Button href={company.phonePrimary.href} variant="onInk" size="lg">
              <Phone className="h-5 w-5" aria-hidden="true" />
              {company.phonePrimary.display}
            </Button>
            <Button
              href={company.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              variant="onInk"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
