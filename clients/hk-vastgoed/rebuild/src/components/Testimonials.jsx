import { testimonials, testimonialsArePlaceholder } from '../data/testimonials.js'

// Renders the testimonials section. When the content is placeholder/demo (no
// verified reviews yet), a clearly-visible notice is shown so nobody mistakes
// these for real customer reviews.
export default function Testimonials() {
  return (
    <div>
      {testimonialsArePlaceholder && (
        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
          <span aria-hidden="true">ⓘ</span>
          Voorbeeldweergave — echte klantreviews worden toegevoegd zodra deze beschikbaar zijn.
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure key={i} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <div className="mb-3 flex gap-0.5 text-brand-400" aria-hidden="true">
              {'★★★★★'}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-ink-muted">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-ink">
              {t.author}
              {t.location && <span className="font-normal text-ink-muted"> · {t.location}</span>}
              {t.isPlaceholder && (
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                  voorbeeld
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
