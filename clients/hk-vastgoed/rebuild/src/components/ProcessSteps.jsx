import { processSteps } from '../data/process.js'

export default function ProcessSteps() {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {processSteps.map((s) => (
        <li key={s.step} className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <span className="text-4xl font-extrabold text-brand-200">{s.step}</span>
          <h3 className="mt-2 text-xl">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}
