import { Phone, MessageCircle, ShieldCheck, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

/** Homepage hero: claim + offerte/bel/WhatsApp CTAs over a real roof photo. */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-text-invert">
      {/* Background photo + dark overlay for legibility */}
      <div className="absolute inset-0">
        <img
          src="/images/all-in-daktechniek/slider-platte-daken.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-40"
          fetchPriority="high"
          width={1600}
          height={1067}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/60" />
      </div>

      <Container className="relative py-16 sm:py-24 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-green">Dakdekker in Honselersdijk &amp; omgeving</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-text-invert sm:text-5xl">
            De dakdekker met ervaring voor elk dak
          </h1>
          <p className="mt-5 max-w-xl text-lg text-text-invert/80">
            Platte daken, pannendaken, lood- en zinkwerk, schoorstenen, dakisolatie en EPDM.
            Vakwerk van een ervaren team, met een kosteloze dakinspectie en een heldere offerte.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-invert/80">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green" aria-hidden="true" />
              {company.trust.vca.value}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green" aria-hidden="true" />
              {company.trust.freeInspection.value}
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
