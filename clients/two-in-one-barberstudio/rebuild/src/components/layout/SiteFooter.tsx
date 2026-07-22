import { MapPin, Phone, Mail, CalendarCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { business, fullAddress } from "@/data/business";

const hm = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

const order = [1, 2, 3, 4, 5, 6, 0];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-text-muted">
              Barbershop in {business.city}. Verzorgd herenknippen, kinderknippen en meer.
            </p>
            <a
              href={business.booking.base}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cream px-4 font-semibold text-ink transition-colors hover:bg-cream-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Boek afspraak
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-cream">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-text-body">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cream" aria-hidden="true" />
                <a href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  {fullAddress}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-cream" aria-hidden="true" />
                <a href={business.phone.href} className="hover:text-cream">{business.phone.display}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-cream" aria-hidden="true" />
                <a href={`mailto:${business.email}`} className="break-all hover:text-cream">{business.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-cream">Openingstijden</h2>
            <ul className="mt-4 space-y-1.5 text-sm text-text-body">
              {order.map((di) => {
                const day = business.hours.find((h) => h.dayIndex === di)!;
                return (
                  <li key={di} className="flex justify-between gap-4">
                    <span>{day.label}</span>
                    <span className="tabular-nums text-text-muted">
                      {day.range ? `${hm(day.range[0])}–${hm(day.range[1])}` : "Gesloten"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {business.name}. Alle rechten voorbehouden.</p>
          <p>Concept-preview — nog niet gepubliceerd.</p>
        </div>
      </Container>
    </footer>
  );
}
