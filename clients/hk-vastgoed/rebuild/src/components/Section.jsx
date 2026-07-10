// Vertical rhythm + centred content wrapper used by every page section.
export default function Section({ children, className = '', tone = 'default', id }) {
  const tones = {
    default: 'bg-white',
    muted: 'bg-brand-50/60',
    ink: 'bg-ink text-white',
  }
  return (
    <section id={id} className={`py-16 sm:py-20 ${tones[tone] || tones.default} ${className}`}>
      <div className="container-content">{children}</div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, intro, center = false, invert = false }) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} mb-10 max-w-2xl`}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 className={`text-3xl sm:text-4xl ${invert ? 'text-white' : ''}`}>{title}</h2>
      {intro && (
        <p className={`mt-4 text-lg ${invert ? 'text-white/80' : 'text-ink-muted'}`}>{intro}</p>
      )}
    </div>
  )
}
