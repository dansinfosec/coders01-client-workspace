import { useState } from 'react'
import { faqs } from '../data/faqs.js'

// Accordion with a smooth grid-rows height transition (reduced-motion users get
// an instant open via the global CSS override).
function Item({ q, a, open, onToggle, id }) {
  return (
    <div className="border-b border-sand-200 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-panel-${id}`}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-ink transition-colors hover:text-brand-700"
        >
          {q}
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-transform duration-300 ${
              open ? 'rotate-45' : ''
            }`}
            aria-hidden="true"
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={`faq-panel-${id}`}
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-ink-muted">{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
      {faqs.map((f, i) => (
        <Item
          key={i}
          id={i}
          q={f.q}
          a={f.a}
          open={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  )
}
