import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Hero from '../components/Hero.jsx'
import TrustStrip from '../components/TrustStrip.jsx'
import Section, { SectionHeading } from '../components/Section.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import ProcessSteps from '../components/ProcessSteps.jsx'
import ProjectGallery from '../components/ProjectGallery.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Faq from '../components/Faq.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import Button from '../components/Button.jsx'
import Reveal from '../components/Reveal.jsx'
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
      <TrustStrip />

      {/* Main services */}
      <Section>
        <SectionHeading
          eyebrow="Onze diensten"
          title="Vakwerk voor elk type dak"
          intro="Van een acute lekkage tot een complete renovatie — bekijk waar wij u mee kunnen helpen."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((s, i) => (
            <Reveal key={s.slug} delay={Math.min(i * 90, 450)}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button to="/diensten" variant="secondary">Bekijk alle diensten</Button>
        </div>
      </Section>

      {/* Why choose HK — dark trust band */}
      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Waarom HK Vastgoedonderhoud?"
              title="Meer dan 25 jaar een goed dak boven uw hoofd"
              intro="Wat begon als een klein familiebedrijf is uitgegroeid tot een vertrouwde partner voor particulieren en bedrijven. U hoeft geen verstand van daken te hebben — wij leggen alles rustig uit en komen onze afspraken na."
              invert
            />
            <div className="flex flex-wrap gap-2">
              {company.certifications.map((c) => (
                <span key={c} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-300" aria-hidden="true">
                    <path d="M12 2l7 3v6c0 4.5-3 8.3-7 9-4-.7-7-4.5-7-9V5z" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <Reveal as="li" key={r.title} delay={i * 80} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-base font-bold text-white">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{r.body}</p>
              </Reveal>
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
        <ProjectGallery limit={5} />
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
          <Reveal className="order-2 overflow-hidden rounded-2xl shadow-card lg:order-1">
            <img src="/images/about-roof.jpg" alt="Dakdekker aan het werk op locatie" className="h-full w-full object-cover" loading="lazy" />
          </Reveal>
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
