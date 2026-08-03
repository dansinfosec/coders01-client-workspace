import { MapPin, Phone, Clock, Navigation, ClipboardCheck } from "lucide-react";
import { business, fullAddress, directionsUrl, CTA_LABEL } from "@/data/business";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import { Section } from "@/components/ui/Section";

const fmt = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

export function LocationContact() {
  const status = useOpenStatus();

  return (
    <Section id="contact" aria-labelledby="contact-title">
      <div className="max-w-prose">
        <p className="eyebrow">
          <span className="accent-rule" aria-hidden />
          Contact &amp; locatie
        </p>
        <h2 id="contact-title" className="mt-4 text-3xl font-bold sm:text-4xl">
          Kom langs of neem contact op
        </h2>
        <p className="mt-4 text-text-body">
          Handelsnaam Allround Schadeherstel Utrecht — onze werkplaats bevindt zich
          in Woerden.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Contact details + hours */}
        <div className="rounded-2xl border border-line bg-surface-muted/50 p-6 sm:p-8">
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange" aria-hidden />
              <div>
                <p className="font-semibold text-text-strong">Adres</p>
                <p className="text-text-body">{fullAddress}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-orange" aria-hidden />
              <div>
                <p className="font-semibold text-text-strong">Telefoon</p>
                <a href={business.phone.href} className="text-text-body hover:text-orange">
                  {business.phone.display}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-orange" aria-hidden />
              <div className="w-full">
                <p className="flex items-center gap-2 font-semibold text-text-strong">
                  Openingstijden
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      status.isOpen
                        ? "bg-success/15 text-success"
                        : "bg-surface-raised text-text-muted"
                    }`}
                  >
                    {status.isOpen ? "Nu geopend" : "Gesloten"}
                  </span>
                </p>
                <table className="mt-3 w-full text-sm">
                  <tbody>
                    {business.hours.map((h) => (
                      <tr
                        key={h.dayIndex}
                        className={h.dayIndex === status.todayIndex ? "text-text-strong" : "text-text-muted"}
                      >
                        <th scope="row" className="py-1 pr-4 text-left font-medium">
                          {h.label}
                        </th>
                        <td className="py-1 text-right tabular-nums">
                          {h.range ? `${fmt(h.range[0])} – ${fmt(h.range[1])}` : "Gesloten"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </li>
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#aanvraag"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-orange-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              {CTA_LABEL}
            </a>
            <a
              href={business.phone.href}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line px-5 py-3 text-sm font-semibold text-text-strong transition-colors hover:border-orange hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Bel direct
            </a>
          </div>
        </div>

        {/* Route panel */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface-raised p-6 sm:p-8">
          <div className="diagonal-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange/10 blur-2xl"
            aria-hidden
          />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange text-ink">
              <MapPin className="h-6 w-6" aria-hidden />
            </span>
            <p className="mt-5 text-lg font-semibold text-text-strong">{fullAddress}</p>
            <p className="mt-1 text-sm text-text-muted">
              Coördinaten: {business.coordinates.lat.toFixed(5)}, {business.coordinates.lng.toFixed(5)}
            </p>
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-lg border border-orange/50 bg-orange/10 px-5 py-3 text-sm font-semibold text-orange transition-colors hover:bg-orange hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Navigation className="h-4 w-4" aria-hidden />
            Route via Google Maps
          </a>
        </div>
      </div>
    </Section>
  );
}
