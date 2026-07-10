import { useParams, Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Section, { SectionHeading } from '../components/Section.jsx'
import Button from '../components/Button.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import NotFound from './NotFound.jsx'
import { company } from '../data/company.js'
import { getService, services } from '../data/services.js'

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = getService(slug)

  // Unknown slug → show the 404 page (keeps the invalid URL visible).
  if (!service) return <NotFound />

  const others = services.filter((s) => s.slug !== slug).slice(0, 3)

  return (
    <>
      <Seo title={service.title} description={service.intro} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <img src={service.image} alt={service.title} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 to-ink/60" />
        <div className="container-content py-16 sm:py-20">
          <nav className="mb-4 text-sm text-white/70" aria-label="Kruimelpad">
            <Link to="/" className="hover:text-white">Home</Link> <span aria-hidden="true">/</span>{' '}
            <Link to="/diensten" className="hover:text-white">Diensten</Link>{' '}
            <span aria-hidden="true">/</span> <span className="text-white">{service.title}</span>
          </nav>
          <h1 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">{service.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{service.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/offerte" variant="secondary" className="border-white bg-white text-brand-700 hover:bg-brand-50">
              Offerte aanvragen
            </Button>
            <Button href={company.phone.href} variant="ghost">Bel {company.phone.display}</Button>
          </div>
        </div>
      </section>

      {/* Body */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {service.sections && service.sections.length > 0 ? (
              <div className="prose-block max-w-none">
                {service.sections.map((sec) => (
                  <div key={sec.heading}>
                    <h2>{sec.heading}</h2>
                    {sec.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose-block max-w-none">
                <h2>Wat kunt u van ons verwachten?</h2>
                <p>{service.intro}</p>
                <p>
                  We beginnen altijd met een gratis en vrijblijvende inspectie. U krijgt eerlijk
                  advies, een heldere offerte zonder kleine lettertjes en een nette, vakkundige
                  uitvoering. We werken pas af als u tevreden bent.
                </p>
                <p>
                  Benieuwd wat er voor uw situatie nodig is?{' '}
                  <Link to="/offerte" className="font-semibold text-brand-700 hover:underline">
                    Vraag een vrijblijvende offerte aan
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
                <h3 className="text-lg font-bold">Gratis dakinspectie</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Vrijblijvend advies op locatie, binnen 24 uur reactie.
                </p>
                <Button to="/offerte" className="mt-4 w-full">Offerte aanvragen</Button>
                <a href={company.phone.href} className="btn-secondary mt-3 w-full">
                  Bel {company.phone.display}
                </a>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Gecertificeerd</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {company.certifications.map((c) => (
                    <li key={c} className="flex items-center gap-2">
                      <span className="text-brand-600">✓</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {/* Related services */}
      <Section tone="muted">
        <SectionHeading title="Andere diensten" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  )
}
