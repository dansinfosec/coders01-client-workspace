import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { company } from "@/data/company";
import { footerNav } from "@/data/navigation";
import { formatRanges } from "@/lib/openingHours";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-text-invert">
      <div aria-hidden="true" className="h-2 w-full bg-hazard" />
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        {/* Brand + NAP */}
        <div className="lg:col-span-4">
          <Logo invert />
          <p className="mt-4 max-w-xs text-sm text-text-invert/70">{company.tagline}</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <a href={company.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-signal">
                {company.address.street}, {company.address.postalCode} {company.address.city}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-signal" />
              <a href={company.phone.href} className="hover:text-signal">{company.phone.display}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-signal" />
              <a href={`mailto:${company.email}`} className="hover:text-signal">{company.email}</a>
            </li>
          </ul>
          <p className="mt-4 font-mono text-xs text-text-invert/60">
            ANWB Alarmcentrale (pech): {company.anwbAlarm}
          </p>
        </div>

        {/* Link columns */}
        {footerNav.map((col) => (
          <nav key={col.heading} aria-label={col.heading} className="lg:col-span-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-signal">
              {col.heading}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-text-invert/75">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-signal">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Opening hours */}
        <div className="lg:col-span-2">
          <h2 className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-signal">
            <Clock className="h-3.5 w-3.5" /> Openingstijden
          </h2>
          <dl className="mt-4 space-y-1 font-mono text-xs text-text-invert/75">
            {company.openingHours.map((day) => (
              <div key={day.day} className="flex justify-between gap-2">
                <dt>{day.day.slice(0, 2)}</dt>
                <dd className={day.ranges.length === 0 ? "text-text-invert/40" : ""}>{formatRanges(day)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <div className="border-t border-line-invert">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-text-invert/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {company.name}. Alle rechten voorbehouden.</p>
          <div className="flex gap-4">
            <Link to="/cookiebeleid" className="hover:text-signal">Cookiebeleid</Link>
            <Link to="/privacy" className="hover:text-signal">Privacy</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
