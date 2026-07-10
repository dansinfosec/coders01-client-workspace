import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Hero from '../components/Hero.jsx'
import Section, { SectionHeading } from '../components/Section.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import ProcessSteps from '../components/ProcessSteps.jsx'
import ProjectGallery from '../components/ProjectGallery.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Faq from '../components/Faq.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import Button from '../components/Button.jsx'
import { company, reasons } from '../data/company.js'
import { featuredServices } from '../data/services.js'

export default function Home() {
  return (
    <>
      <Seo
        title="Dakdekker & vastgoedonderhoud"
        description="HK Vastgoed & Onderhoud: uw betrouwbare dakdekker voor reparatie, renovatie, isolatie en onderhoud van platte en hellende daken. Gratis en vrijblijvende dakinspectie."
      />
      <Hero />

      {/* Trust points strip */}
      <div className="border-b border-slate-100 bg-white">
        <div className="container-content grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Gratis inspectie', 'Vrijblijvend advies op locatie'],
            ['Binnen 24 uur reactie', 'Snel geholpen, ook bij spoed'],
            ['Gecertificeerd', 'VCA & Kwaliteitsvakman'],
            ['3 vestigingen', 'Soest · Haarlem · Amsterdam'],
          ].map(([title, sub]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.1 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink-muted">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main services */}
      <Section>
        <SectionHeading
          eyebrow="Onze diensten"
          title="Vakwerk voor elk type dak"
          intro="Van een acute lekkage tot een complete renovatie — bekijk waar wij u mee kunnen helpen."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button to="/diensten" variant="secondary">Bekijk alle diensten</Button>
        </div>
      </Section>

      {/* Why choose HK */}
      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Waarom HK Vastgoed & Onderhoud"
              title="Een goed dak is meer dan alleen een afdekking"
              intro="U hoeft geen verstand van daken te hebben. Wij leggen alles rustig uit, komen onze afspraken na en werken netjes af — ook na afloop."
            />
            <Button to="/over-ons" variant="secondary">Meer over ons</Button>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                <h3 className="text-base font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Recent projects */}
      <Section>
        <SectionHeading
          eyebrow="Projecten"
          title="Onze recente werkzaamheden"
          intro="Een greep uit ons eigen werk — van platte daken en bitumen tot nokvorsten en renovaties."
        />
        <ProjectGallery limit={6} />
        <div className="mt-10 text-center">
          <Button to="/projecten" variant="secondary">Bekijk alle projecten</Button>
        </div>
      </Section>

      {/* Working process */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Werkwijze"
          title="Zo gaan we te werk"
          intro="Duidelijk en transparant, van het eerste contact tot de oplevering."
          center
        />
        <ProcessSteps />
      </Section>

      {/* Service area */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 overflow-hidden rounded-2xl shadow-card lg:order-1">
            <img src="/images/about-roof.jpg" alt="Dakdekker aan het werk op locatie" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Werkgebied"
              title="Een betrouwbare dakdekker bij u in de buurt"
              intro="Vanuit onze vestigingen in Soest, Haarlem en Amsterdam werken we in de omgeving en daarbuiten."
            />
            <ul className="flex flex-wrap gap-2">
              {company.serviceArea.map((area) => (
                <li key={area} className="rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
                  {area}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-ink-muted">
              Twijfelt u of uw locatie binnen ons werkgebied valt?{' '}
              <Link to="/contact" className="font-semibold text-brand-700 hover:underline">
                Neem contact op
              </Link>{' '}
              — we denken graag met u mee.
            </p>
          </div>
        </div>
      </Section>

      {/* Reviews / testimonials */}
      <Section tone="muted">
        <SectionHeading eyebrow="Reviews" title="Dit vinden onze klanten" center />
        <Testimonials />
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHeading eyebrow="Veelgestelde vragen" title="Dakvragen? Hier de antwoorden" center />
        <Faq />
      </Section>

      {/* Final quotation CTA */}
      <CtaBanner />
    </>
  )
}
