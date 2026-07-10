import { company } from '../data/company.js'

// Reusable contact + vestigingen block (used on Contact and Offerte pages).
export default function ContactDetails() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <h3 className="text-lg font-bold">Direct contact</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <dt className="w-24 shrink-0 font-medium text-ink-muted">Telefoon</dt>
            <dd>
              <a href={company.phone.href} className="font-semibold text-brand-700 hover:underline">
                {company.phone.display}
              </a>
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="w-24 shrink-0 font-medium text-ink-muted">E-mail</dt>
            <dd>
              <a href={`mailto:${company.email}`} className="text-ink hover:text-brand-700 hover:underline">
                {company.email}
              </a>
            </dd>
          </div>
          {company.whatsapp?.enabled && (
            <div className="flex items-center gap-3">
              <dt className="w-24 shrink-0 font-medium text-ink-muted">WhatsApp</dt>
              <dd>
                <a
                  href={company.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink hover:text-brand-700 hover:underline"
                >
                  {company.whatsapp.display}
                </a>
              </dd>
            </div>
          )}
          <div className="flex items-start gap-3">
            <dt className="w-24 shrink-0 font-medium text-ink-muted">Reactie</dt>
            <dd className="text-ink-muted">{company.responsePromise}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <h3 className="text-lg font-bold">Vestigingen</h3>
        <ul className="mt-4 space-y-4 text-sm">
          {company.locations.map((loc) => (
            <li key={loc.city}>
              <p className="font-semibold text-ink">{loc.label}</p>
              <p className="text-ink-muted">
                {loc.street}
                <br />
                {loc.postcode} {loc.city}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
