import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { footerNav } from "@/data/navigation";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";

export function SiteFooter() {
  const year = 2026; // NB: statisch — geen Date() in de bundel; jaarlijks bijwerken.

  return (
    <footer className="bg-asphalt text-paper/80">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Merk + adres */}
          <div>
            <Logo invert />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">{company.tagline}</p>
            <address className="mt-5 space-y-2 text-sm not-italic">
              <a href={company.address.mapsUrl} className="flex items-start gap-2.5 hover:text-white" target="_blank" rel="noreferrer">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
                <span>
                  {company.address.street}
                  <br />
                  {company.address.postalCode} {company.address.city}
                </span>
              </a>
              <a href={company.phone.href} className="flex items-center gap-2.5 hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-petrol" aria-hidden />
                <span className="font-mono">{company.phone.display}</span>
              </a>
              <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-petrol" aria-hidden />
                {company.email}
              </a>
            </address>
          </div>

          {/* Diensten */}
          <nav aria-label="Diensten">
            <h2 className="font-mono text-2xs uppercase tracking-label text-paper/50">Diensten</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerNav.diensten.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Ontdek */}
          <nav aria-label="Ontdek">
            <h2 className="font-mono text-2xs uppercase tracking-label text-paper/50">Ontdek</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerNav.ontdek.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Openingstijden + CTA's */}
          <div>
            <h2 className="flex items-center gap-2 font-mono text-2xs uppercase tracking-label text-paper/50">
              <Clock className="h-3.5 w-3.5" aria-hidden /> Openingstijden
            </h2>
            <ul className="mt-4 space-y-1.5 font-mono text-xs">
              {company.openingHours.map((d) => (
                <li key={d.weekday} className="flex justify-between gap-4">
                  <span className="text-paper/60">{d.day}</span>
                  <span>
                    {d.ranges.length === 0
                      ? "Gesloten"
                      : d.ranges
                          .map(([o, c]) => `${fmt(o)}–${fmt(c)}`)
                          .join(", ")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2">
              <Button to={paths.afspraak} size="sm" block>
                Afspraak maken
              </Button>
              <Button to={paths.autoVerkopen} variant="accent" size="sm" block>
                Auto verkopen
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line-invert py-6 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {company.name}. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-4">
            <a
              href={company.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white"
            >
              <Facebook className="h-4 w-4" aria-hidden /> Facebook
            </a>
            <Link to={paths.contact} className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

const fmt = (minutes: number) => {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};
