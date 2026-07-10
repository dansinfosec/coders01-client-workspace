import { faqs } from '../data/faqs.js'

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      {faqs.map((f, i) => (
        <details key={i} className="group p-5 open:bg-brand-50/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
            {f.q}
            <span className="text-brand-600 transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{f.a}</p>
        </details>
      ))}
    </div>
  )
}
