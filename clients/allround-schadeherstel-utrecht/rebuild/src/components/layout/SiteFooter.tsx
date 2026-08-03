import { Phone, MapPin } from "lucide-react";
import { navItems } from "@/data/nav";
import { business, fullAddress } from "@/data/business";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-anthracite pb-24 pt-14 lg:pb-14">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <Logo className="h-10" />
            <p className="mt-4 max-w-prose text-sm text-text-muted">
              Allround schadeherstel voor auto, motor, scooter en boot — voor
              particulieren, bedrijven en verzekeringsschades. Persoonlijk en
              direct contact.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-strong">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2 text-text-body">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange" aria-hidden />
                <span>{fullAddress}</span>
              </li>
              <li>
                <a
                  href={business.phone.href}
                  className="flex items-center gap-2 text-text-body hover:text-orange"
                >
                  <Phone className="h-4 w-4 shrink-0 text-orange" aria-hidden />
                  {business.phone.display}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Footer navigatie">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-strong">
              Menu
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-text-body hover:text-orange">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {business.name}. Alle rechten voorbehouden.</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Privacybeleid (in voorbereiding)</span>
            <span aria-hidden className="text-line">·</span>
            <span>Ontwerp &amp; realisatie: Coders01</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
