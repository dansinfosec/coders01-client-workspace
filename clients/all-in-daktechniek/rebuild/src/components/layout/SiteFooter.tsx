import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { company, fullAddress } from "@/data/company";
import { services } from "@/data/services";
import { footerNav } from "@/data/navigation";
import { servicesPath } from "@/routes/paths";

/** Ink footer with NAP, KvK, services and navigation. */
export function SiteFooter() {
  return (
    <footer className="bg-ink text-text-invert">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-text-invert/70">
              Uw dakdekker voor platte daken, pannendaken, lood- en zinkwerk, schoorstenen,
              dakisolatie en EPDM.
            </p>
            <a
              href={company.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="All-in Daktechniek op Facebook"
              className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-invert">Diensten</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={servicesPath(s.slug)}
                    className="text-text-invert/70 hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-invert">Menu</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {footerNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-text-invert/70 hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-invert">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-text-invert/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green" aria-hidden="true" />
                <span>{fullAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />
                <a href={company.phonePrimary.href} className="hover:text-green">
                  {company.phonePrimary.display}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />
                <a href={company.phoneSecondary.href} className="hover:text-green">
                  {company.phoneSecondary.display}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="break-all hover:text-green">
                  {company.email}
                </a>
              </li>
              <li className="pt-1 text-text-invert/50">KvK: {company.kvk}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line-invert pt-6 text-xs text-text-invert/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. Alle rechten voorbehouden.</p>
          <p>Concept-demo — nog niet gepubliceerd.</p>
        </div>
      </Container>
    </footer>
  );
}
