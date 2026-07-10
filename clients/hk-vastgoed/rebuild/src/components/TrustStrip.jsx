// Trust strip shown directly below the hero. VERIFIED facts only:
// 25+ years, certifications, free inspection, clear quotes, 3 locations.
const items = [
  {
    label: '25+ jaar ervaring',
    sub: 'Vakmanschap sinds jaar en dag',
    icon: (
      <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.3 7.2 17l.9-5.4L4.2 7.7l5.4-.8z" />
    ),
  },
  {
    label: 'VCA & Kwaliteitsvakman',
    sub: 'Gecertificeerd en veilig werken',
    icon: <path d="M12 2l7 3v6c0 4.5-3 8.3-7 9-4-0.7-7-4.5-7-9V5z M9.5 12l1.8 1.8L15 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    label: 'Gratis dakinspectie',
    sub: 'Vrijblijvend advies op locatie',
    icon: <path d="M11 4a7 7 0 105 12l4 4 1-1-4-4A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z" />,
  },
  {
    label: 'Heldere offerte',
    sub: 'Geen verrassingen achteraf',
    icon: <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zm7 1.5V8h3.5zM9 12h8v1.5H9zm0 3h8v1.5H9z" />,
  },
  {
    label: '3 vestigingen',
    sub: 'Soest · Haarlem · Amsterdam',
    icon: <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />,
  },
]

export default function TrustStrip() {
  return (
    <div className="border-y border-sand-200 bg-sand-50">
      <div className="container-content grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-3 lg:grid-cols-5">
        {items.map((it) => (
          <div key={it.label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {it.icon}
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-ink">{it.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
