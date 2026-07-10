import Seo from '../components/Seo.jsx'
import Section from '../components/Section.jsx'
import LeadForm from '../components/LeadForm.jsx'
import ContactDetails from '../components/ContactDetails.jsx'

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact"
        description="Neem contact op met HK Vastgoed & Onderhoud. Bel 085 - 060 0397, mail ons of vul het contactformulier in. We reageren doorgaans binnen 24 uur."
      />

      <section className="border-b border-slate-100 bg-brand-50/60">
        <div className="container-content py-14 sm:py-16">
          <p className="eyebrow mb-2">Contact</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Kom direct met ons in contact</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Vragen, opmerkingen of een gratis dakinspectie aanvragen? Laat uw gegevens achter of bel
            ons direct. We denken graag met u mee.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold">Stuur ons een bericht</h2>
            <p className="mt-2 text-sm text-ink-muted">Velden met een * zijn verplicht.</p>
            <div className="mt-6">
              <LeadForm variant="contact" />
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
