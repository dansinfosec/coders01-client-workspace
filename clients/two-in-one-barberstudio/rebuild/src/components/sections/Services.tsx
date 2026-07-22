import { CalendarCheck } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { services } from "@/data/services";

export function Services() {
  return (
    <Section id="diensten" tone="muted" ariaLabel="Diensten en prijzen">
      <SectionHeading
        eyebrow="Diensten & prijzen"
        title="Wat wij voor u doen"
        intro="Vaste, eerlijke prijzen. Boek een behandeling direct online — of loop binnen."
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
              {service.bookingUrl && (
                <a
                  href={service.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cream/40 px-4 text-sm font-semibold text-cream transition-colors hover:bg-cream hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Boek deze behandeling
                </a>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-text-muted">
        Prijzen zoals vermeld in de online agenda. Haarpigmentatie en tattoo removal op afspraak —
        vraag gerust naar de mogelijkheden.
      </p>
    </Section>
  );
}
