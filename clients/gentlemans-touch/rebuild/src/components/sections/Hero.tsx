import { CalendarCheck, Phone, Star, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/data/business";
import { heroImage } from "@/data/gallery";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-text-strong">
      <div className="absolute inset-0">
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          className="h-full w-full object-cover object-center opacity-45"
          fetchPriority="high"
          width={900}
          height={1600}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
      </div>

      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl animate-fade-up">
          <p className="eyebrow">
            <span className="h-px w-6 bg-red" aria-hidden="true" />
            Barbershop in {business.city}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] text-cream-strong sm:text-6xl">
            Gentleman&rsquo;s Touch
          </h1>
          <p className="mt-3 text-lg font-medium uppercase tracking-widest text-text-muted sm:text-xl">
            {business.tagline}
          </p>
          <p className="mt-6 max-w-xl text-lg text-text-body">
            Verzorgd herenknippen, strakke fades en baardverzorging — met oog voor detail en de
            tijd die uw look verdient.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={business.booking.base} target="_blank" rel="noopener noreferrer" size="lg">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Boek afspraak
            </Button>
            <Button href={business.phone.href} variant="outline" size="lg">
              <Phone className="h-5 w-5" aria-hidden="true" /> Bel direct
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-body">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-cream text-cream" aria-hidden="true" />
              <strong className="text-text-strong">{business.rating.toFixed(1)}</strong>
              <span className="text-text-muted">({business.reviewCount} Google-reviews)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-cream" aria-hidden="true" />
              {business.address.street}, {business.city}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
