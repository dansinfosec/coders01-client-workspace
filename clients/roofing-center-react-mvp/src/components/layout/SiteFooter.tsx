import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { footerNav } from "@/data/navigation";
import { company, contact, telLink } from "@/data/company";
import { services } from "@/data/services";
import { ROUTES } from "@/routes/paths";

/** Navy site footer: brand, quick links, services, service area + verified contact. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-navy-900 text-text-invert/80">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm">
              {company.tagline}. Bitumen, EPDM, renovatie, reparatie, lekkageherstel, inspectie en onderhoud van platte daken in {company.serviceArea}.
            </p>
          </div>

          <nav aria-label="Footernavigatie">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-invert">Menu</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {footerNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="rounded text-sm hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-invert">Diensten</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link to={`${ROUTES.diensten}#${s.slug}`} className="rounded text-sm hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-invert">Contact</h2>
            <address className="mt-3 flex flex-col gap-2 text-sm not-italic">
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green" aria-hidden="true" />
                Werkgebied: {company.serviceArea}
              </span>
              {contact.hasPhone && (
                <a href={telLink()} className="flex items-center gap-2 hover:text-green">
                  <Phone className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />
                  {company.phoneDisplay || company.phone}
                </a>
              )}
              {contact.hasEmail && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-green">
                  <Mail className="h-4 w-4 shrink-0 text-green" aria-hidden="true" />
                  {company.email}
                </a>
              )}
              {(!contact.hasPhone || !contact.hasEmail) && (
                <span className="mt-1 text-xs text-text-invert/60">
                  Vraag eenvoudig een offerte of inspectie aan via het formulier.
                </span>
              )}
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line-invert pt-6 text-xs text-text-invert/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} {company.name}. Demo-website — nog geen definitieve bedrijfsgegevens.</p>
          <p>{company.claim}</p>
        </div>
      </Container>
    </footer>
  );
}
