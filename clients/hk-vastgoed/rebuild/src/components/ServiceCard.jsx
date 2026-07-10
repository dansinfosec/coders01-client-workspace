import { Link } from 'react-router-dom'

export default function ServiceCard({ service }) {
  return (
    <Link
      to={`/diensten/${service.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={service.image}
          alt={`${service.title} door HK Vastgoed & Onderhoud`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm text-ink-muted">{service.short}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          Meer over {service.title.toLowerCase()}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  )
}
