import Seo from '../components/Seo.jsx'
import Section from '../components/Section.jsx'
import { company } from '../data/company.js'

// Content below is based on the client's existing privacy statement (crawled
// from /privacy-beleid), restructured for readability. Have the client confirm
// this is the current, authoritative version before launch.
export default function Privacybeleid() {
  return (
    <>
      <Seo
        title="Privacybeleid"
        description="Privacybeleid van HK Vastgoed & Onderhoud: welke gegevens wij verzamelen, met welk doel, hoe lang we ze bewaren en welke rechten u heeft."
      />

      <section className="border-b border-slate-100 bg-brand-50/60">
        <div className="container-content py-14 sm:py-16">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Privacybeleid</h1>
          <p className="mt-4 max-w-2xl text-ink-muted">
            {company.name} hecht grote waarde aan uw privacy. Op deze pagina leest u welke gegevens
            wij verwerken, met welk doel, en welke rechten u heeft.
          </p>
        </div>
      </section>

      <Section>
        <div className="prose-block mx-auto max-w-3xl">
          <h2>Welke gegevens wij verwerken</h2>
          <p>
            Uw persoonsgegevens worden verwerkt wanneer u gebruikmaakt van onze diensten en/of deze
            zelf aan ons verstrekt. Het gaat onder meer om:
          </p>
          <ul>
            <li>IP-adres;</li>
            <li>informatie over uw handelingen op onze website;</li>
            <li>type internetbrowser en apparaatkenmerken.</li>
          </ul>
          <p>
            Onze website heeft niet de intentie gegevens te verzamelen over bezoekers jonger dan 16
            jaar, tenzij zij toestemming hebben van ouder(s) of voogd.
          </p>

          <h2>Doel en grondslag</h2>
          <p>
            Wij verwerken uw gegevens om onze website te optimaliseren en om ons aanbod van diensten
            af te stemmen op uw voorkeuren. {company.name} neemt geen besluiten op basis van
            geautomatiseerde verwerkingen die (aanzienlijke) gevolgen voor personen hebben.
          </p>

          <h2>Bewaartermijn</h2>
          <p>
            Wij bewaren uw persoonsgegevens niet langer dan strikt noodzakelijk om de doelen te
            bereiken waarvoor uw gegevens zijn verzameld.
          </p>

          <h2>Delen met derden</h2>
          <p>
            Wij delen informatie uitsluitend met derden als dit noodzakelijk is voor de uitvoering
            van onze overeenkomst met u, of om te voldoen aan een wettelijke verplichting.
          </p>

          <h2>Cookies</h2>
          <p>
            Wij gebruiken technische en functionele cookies en analytische cookies die uw privacy
            niet schenden. Voor het meten van websitebezoek maken wij gebruik van Google Analytics,
            waarbij het laatste octet van uw IP-adres is gemaskeerd en gegevens niet met Google
            worden gedeeld.
          </p>

          <h2>Uw rechten</h2>
          <p>
            U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te verwijderen.
            Ook kunt u uw toestemming intrekken of bezwaar maken tegen de verwerking. Een verzoek
            kunt u indienen via{' '}
            <a href={`mailto:${company.email}`} className="text-brand-700 underline">
              {company.email}
            </a>
            . Daarnaast heeft u het recht een klacht in te dienen bij de Autoriteit
            Persoonsgegevens.
          </p>

          <h2>Beveiliging</h2>
          <p>
            Wij nemen passende maatregelen om misbruik, verlies, onbevoegde toegang en ongewenste
            openbaarmaking tegen te gaan. Heeft u de indruk dat uw gegevens niet goed beveiligd zijn?
            Neem dan contact met ons op via {company.email}.
          </p>

          <hr className="my-8 border-slate-200" />
          <p className="text-sm text-slate-500">
            Dit privacybeleid is gebaseerd op de bestaande privacyverklaring van {company.name}. De
            definitieve, juridisch bindende versie wordt door de opdrachtgever vastgesteld.
          </p>
        </div>
      </Section>
    </>
  )
}
