import { company } from '../data/company.js'

// Certification blocks — VERIFIED (VCA + Kwaliteitsvakman, referenced in the
// client's own service-page hero and a "Certificaten" section). No scores,
// guarantees or numbers are invented.
export default function Certifications() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {company.certifications.map((c) => (
        <div key={c} className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-card">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2l7 3v6c0 4.5-3 8.3-7 9-4-.7-7-4.5-7-9V5z" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="font-bold text-ink">{c}</p>
            <p className="text-sm text-ink-muted">Veilig en volgens de norm werken.</p>
          </div>
        </div>
      ))}
    </div>
  )
}
