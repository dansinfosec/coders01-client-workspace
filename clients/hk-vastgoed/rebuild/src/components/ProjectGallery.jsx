import Reveal from './Reveal.jsx'
import { projects } from '../data/projects.js'

// Editorial gallery: the first tile spans 2×2 for a stronger focal point; the
// rest form a responsive grid. Real client photos, lazy-loaded below the fold.
export default function ProjectGallery({ limit }) {
  const items = limit ? projects.slice(0, limit) : projects
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[210px] lg:grid-cols-4">
      {items.map((p, i) => {
        const featured = i === 0
        return (
          <Reveal
            as="figure"
            key={p.image}
            delay={Math.min(i * 80, 400)}
            className={`group relative overflow-hidden rounded-2xl bg-sand-100 shadow-card ${
              featured ? 'col-span-2 row-span-2' : ''
            }`}
          >
            <img
              src={p.image}
              alt={p.caption}
              style={{ objectPosition: p.pos || 'center' }}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              loading={i < 2 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold text-white">
              {p.caption}
            </figcaption>
          </Reveal>
        )
      })}
    </div>
  )
}
