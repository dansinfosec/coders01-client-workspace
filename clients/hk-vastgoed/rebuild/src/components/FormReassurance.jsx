// Reassuring trust panel shown next to the contact / quotation forms.
// VERIFIED facts only — no scores, guarantees or numbers invented.
const points = [
  'Gratis en vrijblijvende dakinspectie',
  'U zit nergens aan vast — u beslist zelf',
  'Doorgaans binnen 24 uur reactie',
  'VCA & Kwaliteitsvakman gecertificeerd',
  'Heldere offerte, geen kleine lettertjes',
]

export default function FormReassurance() {
  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
      <h3 className="text-lg font-bold text-ink">Wat u van ons kunt verwachten</h3>
      <ul className="mt-4 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-ink-soft">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.1 0z" clipRule="evenodd" />
            </svg>
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}
