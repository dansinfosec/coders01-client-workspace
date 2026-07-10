import { useParams, Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Section, { SectionHeading } from '../components/Section.jsx'
import Button from '../components/Button.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import ProcessSteps from '../components/ProcessSteps.jsx'
import TrustStrip from '../components/TrustStrip.jsx'
import Reveal from '../components/Reveal.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import NotFound from './NotFound.jsx'
import { company, reasons } from '../data/company.js'
import { getService, services } from '../data/services.js'

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = getService(slug)

  // Unknown slug → show the 404 page (keeps the invalid URL visible).
  if (!service) return <NotFound />

  const others = services.filter((s) => s.slug !== slug).slice(0, 3)
  const serviceBenefits = reasons.slice(0, 4)

  return (
    <>
      <Seo title={service.title} description={service.intro} />

      {/* 1. Service-specific hero */}
      <section className="relative isolate overflow-hidden text-white">
        <img src={service.image} alt={`${service.title} door HK Vastgoed & Onderhoud`} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal-950/95 via-charcoal-950/80 to-charcoal-950/45" />
        <div className="container-content py-16 sm:py-20 lg:py-24">
          <nav className="mb-4 text-sm text-white/70" aria-label="Kruimelpad">
            <Link to="/" className="hover:text-white">Home</Link> <span aria-hidden="true">/</span>{' '}
            <Link to="/diensten" className="hover:text-white">Diensten</Link>{' '}
            <span aria-hidden="true">/</span> <span className="text-white">{service.title}</span>
          </nav>
          <div className="max-w-2xl animate-fade-up">
            <h1 className="text-4xl font-black sm:text-5xl">{service.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-white/85">{service.intro}</p>
            {/* 2. Clear CTA buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button to="/offerte" className="px-6 py-4 text-base">Vraag gratis inspectie aan</Button>
              <Button href={company.phone.href} variant="ghost" className="px-6 py-4 text-base">
                Bel {company.phone.display}
              </Button>
              <WhatsAppButton className="px-6 py-4 text-base" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Short trust strip */}
      <TrustStrip />

      {/* 4. Explanation + sticky CTA sidebar */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal className="prose-block max-w-none">
              {service.sections && service.sections.length > 0 ? (
                <>
                  <h2>Over {service.title.toLowerCase()}</h2>
                  <p>{service.intro}</p>
                  {service.sections.map((sec) => (
                    <div key={sec.heading}>
                      <h2>{sec.heading}</h2>
                      {sec.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <h2>Wat kunt u van ons verwachten?</h2>
                  <p>{service.intro}</p>
                  <p>
                    We beginnen altijd met een gratis en vrijblijvende inspectie. U krijgt eerlijk
                    advies, een heldere offerte zonder kleine lettertjes en een nette, vakkundige
                    uitvoering. We werken pas af als u tevreden bent — en houden u onderweg op de
                    hoogte.
                  </p>
                </>
              )}
            </Reveal>

            {/* 5. When the service is needed */}
            {service.whenNeeded && (
              <Reveal className="mt-10 rounded-2xl border border-sand-200 bg-sand-50 p-6 sm:p-8">
                <h2 className="text-2xl">Wanneer is {service.title.toLowerCase()} nodig?</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-1">
                  {service.whenNeeded.map((w) => (
                    <li key={w} className="flex items-start gap-3 text-ink-soft">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.1 0z" clipRule="evenodd" />
                      </svg>
                      {w}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* Sticky sidebar with repeated CTA + certifications */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
                <h3 className="text-lg font-bold">Gratis dakinspectie</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Vrijblijvend advies op locatie, doorgaans binnen 24 uur reactie.
                </p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <Button to="/offerte" className="w-full">Offerte aanvragen</Button>
                  <a href={company.phone.href} className="btn-secondary w-full">
                    Bel {company.phone.display}
                  </a>
                  <WhatsAppButton className="w-full" />
                </div>
              </div>
              <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
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

      {/* 6. Benefits — why HK */}
      <Section tone="muted">
        <SectionHeading eyebrow="Waarom HK" title={`Waarom kiezen voor HK bij ${service.title.toLowerCase()}`} center />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceBenefits.map((r, i) => (
            <Reveal key={r.title} delay={i * 100} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
              <h3 className="text-base font-bold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{r.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 7. How HK works — process */}
      <Section>
        <SectionHeading eyebrow="Werkwijze" title="Zo gaan we te werk" center />
        <ProcessSteps />
      </Section>

      {/* 8. Related services */}
      <Section tone="warm">
        <SectionHeading title="Andere diensten" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 9. Strong final CTA */}
      <CtaBanner
        title={`Vraag vrijblijvend advies over ${service.title.toLowerCase()}`}
        text="We komen gratis langs, inspecteren uw dak en maken een heldere offerte op maat. U beslist zelf of en wanneer we aan de slag gaan."
      />
    </>
  )
}
