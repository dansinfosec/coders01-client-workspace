import Reveal from './Reveal.jsx'

// Vertical rhythm + centred content wrapper used by every page section.
export default function Section({ children, className = '', tone = 'default', id }) {
  const tones = {
    default: 'bg-white',
    muted: 'bg-sand-50',
    warm: 'bg-sand-100',
    ink: 'bg-charcoal-900 text-white',
  }
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${tones[tone] || tones.default} ${className}`}>
      <div className="container-content">{children}</div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, intro, center = false, invert = false }) {
  return (
    <Reveal className={`${center ? 'mx-auto text-center' : ''} mb-12 max-w-2xl`}>
      {eyebrow && <p className={`eyebrow mb-3 ${center ? 'justify-center' : ''}`}>{eyebrow}</p>}
      <h2 className={`text-3xl sm:text-4xl lg:text-[2.6rem] lg:leading-tight ${invert ? 'text-white' : ''}`}>
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 text-lg ${invert ? 'text-white/80' : 'text-ink-muted'}`}>{intro}</p>
      )}
    </Reveal>
  )
}
