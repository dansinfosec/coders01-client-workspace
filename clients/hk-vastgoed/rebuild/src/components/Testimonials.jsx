import Reveal from './Reveal.jsx'
import { testimonials, testimonialsArePlaceholder } from '../data/testimonials.js'

// Renders the testimonials section. When the content is placeholder/demo (no
// verified reviews yet), a clearly-visible notice is shown so nobody mistakes
// these for real customer reviews.
export default function Testimonials() {
  return (
    <div>
      {testimonialsArePlaceholder && (
        <p className="mx-auto mb-8 flex max-w-xl items-center justify-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800 ring-1 ring-amber-200">
          <span aria-hidden="true">ⓘ</span>
          Voorbeeldweergave — echte klantreviews worden toegevoegd zodra deze beschikbaar zijn.
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal
            as="figure"
            key={i}
            delay={i * 120}
            className="flex flex-col rounded-2xl border border-sand-200 bg-white p-6 shadow-card"
          >
            <div className="mb-3 flex gap-0.5 text-brand-400" aria-hidden="true">
              {'★★★★★'}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-ink-muted">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-sand-200 pt-4 text-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                {t.author.charAt(0)}
              </span>
              <span>
                <span className="block font-semibold text-ink">{t.author}</span>
                {t.location && <span className="text-ink-muted">{t.location}</span>}
              </span>
              {t.isPlaceholder && (
                <span className="ml-auto rounded bg-sand-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                  voorbeeld
                </span>
              )}
            </figcaption>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
