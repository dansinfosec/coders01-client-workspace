import { projects } from '../data/projects.js'

export default function ProjectGallery({ limit }) {
  const items = limit ? projects.slice(0, limit) : projects
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <figure
          key={p.image}
          className={`group relative overflow-hidden rounded-2xl bg-slate-100 shadow-card ${
            i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
          }`}
        >
          <img
            src={p.image}
            alt={p.caption}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              i === 0 ? 'h-64 sm:h-full' : 'h-56'
            }`}
            loading="lazy"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-sm font-medium text-white">
            {p.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
