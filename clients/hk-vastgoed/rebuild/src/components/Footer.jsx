import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { company } from '../data/company.js'
import { services } from '../data/services.js'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-charcoal-950 text-white/70">
      <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo invert />
          <p className="mt-4 max-w-xs text-sm text-white/55">
            {company.experienceLabel}. Uw dak in vertrouwde handen — van inspectie tot oplevering.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {company.certifications.map((c) => (
              <li
                key={c}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/70"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Diensten</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link to={`/diensten/${s.slug}`} className="hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/diensten" className="font-medium text-brand-300 hover:text-white">
                Alle diensten →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Navigatie</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/projecten" className="hover:text-white">Projecten</Link></li>
            <li><Link to="/over-ons" className="hover:text-white">Over ons</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/offerte" className="hover:text-white">Offerte aanvragen</Link></li>
            <li><Link to="/privacybeleid" className="hover:text-white">Privacybeleid</Link></li>
            <li><Link to="/algemene-voorwaarden" className="hover:text-white">Algemene voorwaarden</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={company.phone.href} className="font-semibold text-white hover:text-brand-300">
                {company.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="hover:text-white">
                {company.email}
              </a>
            </li>
            {company.whatsapp?.enabled && (
              <li>
                <a
                  href={company.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp: {company.whatsapp.display}
                </a>
              </li>
            )}
            {company.locations.map((loc) => (
              <li key={loc.city} className="text-white/55">
                <span className="block font-medium text-white/70">{loc.label}</span>
                {loc.street}, {loc.postcode} {loc.city}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-content flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/45 sm:flex-row">
          <p>© {year} {company.name}. Alle rechten voorbehouden.</p>
          <p>KvK-nummer volgt · Website — MVP-demo</p>
        </div>
      </div>
    </footer>
  )
}
