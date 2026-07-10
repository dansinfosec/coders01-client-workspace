import Reveal from './Reveal.jsx'
import { processSteps } from '../data/process.js'

export default function ProcessSteps() {
  return (
    <ol className="relative grid gap-6 md:grid-cols-3">
      {/* Connecting line on desktop. */}
      <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block" aria-hidden="true" />
      {processSteps.map((s, i) => (
        <Reveal as="li" key={s.step} delay={i * 120} className="relative rounded-2xl border border-sand-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-black text-white shadow-cta">
            {s.step}
          </span>
          <h3 className="mt-4 text-xl">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
        </Reveal>
      ))}
    </ol>
  )
}
