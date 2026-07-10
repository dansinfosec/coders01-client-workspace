import Seo from '../components/Seo.jsx'
import Section from '../components/Section.jsx'
import { company } from '../data/company.js'

// The client's site has an "Algemene voorwaarden" page, but its full legal text
// was not fully captured/validated during scraping. Rather than paraphrase legal
// terms (which must be exact), this page provides the company identification and
// a clear notice that the authoritative terms are to be supplied by the client.
export default function AlgemeneVoorwaarden() {
  return (
    <>
      <Seo
        title="Algemene voorwaarden"
        description="Algemene voorwaarden van HK Vastgoed & Onderhoud. De volledige, bindende voorwaarden worden op aanvraag verstrekt."
      />

      <section className="border-b border-slate-100 bg-brand-50/60">
        <div className="container-content py-14 sm:py-16">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Algemene voorwaarden</h1>
          <p className="mt-4 max-w-2xl text-ink-muted">
            Op al onze offertes, opdrachten en overeenkomsten zijn onze algemene voorwaarden van
            toepassing.
          </p>
        </div>
      </section>

      <Section>
        <div className="prose-block mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 not-prose">
            <p className="text-sm text-amber-900">
              <strong>Let op:</strong> de volledige, juridisch bindende algemene voorwaarden worden
              door {company.name} aangeleverd en hier integraal geplaatst vóór livegang. Onderstaande
              gegevens dienen ter identificatie van het bedrijf.
            </p>
          </div>

          <h2>Bedrijfsgegevens</h2>
          <ul>
            <li><strong>Bedrijf:</strong> {company.name}</li>
            <li>
              <strong>Hoofdvestiging:</strong> {company.locations[0].street},{' '}
              {company.locations[0].postcode} {company.locations[0].city}
            </li>
            <li><strong>Telefoon:</strong> {company.phone.display}</li>
            <li><strong>E-mail:</strong> {company.email}</li>
            <li><strong>KvK-nummer:</strong> <em>volgt</em></li>
            <li><strong>BTW-nummer:</strong> <em>volgt</em></li>
          </ul>

          <h2>Toepasselijkheid</h2>
          <p>
            Deze voorwaarden zijn van toepassing op alle aanbiedingen, offertes en overeenkomsten
            tussen {company.name} en de opdrachtgever. Afwijkingen gelden uitsluitend indien deze
            schriftelijk zijn overeengekomen.
          </p>

          <h2>Offertes</h2>
          <p>
            Al onze offertes zijn vrijblijvend en gebaseerd op de tijdens de inspectie vastgestelde
            situatie. Kosten worden vooraf helder in kaart gebracht, zonder verborgen posten.
          </p>

          <p className="text-sm text-slate-500">
            Heeft u vragen over onze voorwaarden? Neem gerust{' '}
            <a href={`mailto:${company.email}`} className="text-brand-700 underline">contact</a> met
            ons op.
          </p>
        </div>
      </Section>
    </>
  )
}
