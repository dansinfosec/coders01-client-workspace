import { Phone } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { services } from "@/data/services";
import { business, BOOK_LABEL } from "@/data/business";

export function Services() {
  return (
    <Section id="diensten" tone="muted" ariaLabel="Diensten en prijzen">
      <SectionHeading
        eyebrow="Diensten & prijzen"
        title="Wat wij voor u doen"
        intro="Vaste, eerlijke prijzen. Loop binnen of bel ons om een afspraak in te plannen."
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <li
              key={service.name}
              className="flex h-full flex-col rounded-2xl border border-line bg-ink p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-ink-700 text-cream">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                {service.price ? (
                  <span className="font-serif text-2xl font-bold text-cream">{service.price}</span>
                ) : (
                  <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Op aanvraag
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg">{service.name}</h3>
              <p className="mt-2 flex-1 text-sm text-text-body">{service.description}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button href={business.phone.href}>
          <Phone className="h-5 w-5" aria-hidden="true" /> {BOOK_LABEL}
        </Button>
        <p className="text-sm text-text-muted">
          Online boeken is binnenkort beschikbaar. Haarpigmentatie en tattoo removal op afspraak.
        </p>
      </div>
    </Section>
  );
}
