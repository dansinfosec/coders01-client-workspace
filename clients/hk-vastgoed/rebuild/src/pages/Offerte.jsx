import Seo from '../components/Seo.jsx'
import Section from '../components/Section.jsx'
import LeadForm from '../components/LeadForm.jsx'
import ContactDetails from '../components/ContactDetails.jsx'
import { trustPoints } from '../data/company.js'

export default function Offerte() {
  return (
    <>
      <Seo
        title="Offerte aanvragen"
        description="Vraag een vrijblijvende offerte aan bij HK Vastgoed & Onderhoud. Beschrijf uw situatie en ontvang een heldere prijsopgave zonder verrassingen achteraf."
      />

      <section className="border-b border-slate-100 bg-brand-50/60">
        <div className="container-content py-14 sm:py-16">
          <p className="eyebrow mb-2">Offerte</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Vraag een vrijblijvende offerte aan</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Vertel ons kort waar u mee zit. We komen vrijblijvend langs voor een inspectie en maken
            een heldere offerte op maat — zonder kleine lettertjes.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {trustPoints.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-medium text-ink">
                <span className="text-brand-600">✓</span> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold">Uw aanvraag</h2>
            <p className="mt-2 text-sm text-ink-muted">Velden met een * zijn verplicht.</p>
            <div className="mt-6">
              <LeadForm variant="quote" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <ContactDetails />
          </div>
        </div>
      </Section>
    </>
  )
}
