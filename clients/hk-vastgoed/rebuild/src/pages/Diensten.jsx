import Seo from '../components/Seo.jsx'
import Section, { SectionHeading } from '../components/Section.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import { services } from '../data/services.js'

export default function Diensten() {
  return (
    <>
      <Seo
        title="Onze diensten"
        description="Bekijk alle diensten van HK Vastgoed & Onderhoud: dakreparatie, renovatie, isolatie, platte daken, daklekkage, stormschade, dakramen, dakkapellen en meer."
      />

      <section className="border-b border-sand-200 bg-brand-50/60">
        <div className="container-content py-14 sm:py-16">
          <p className="eyebrow mb-2">Onze diensten</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Vakwerk voor elk type dak</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Of het nu gaat om een kleine reparatie of een complete renovatie: wij zorgen voor een
            oplossing die lang meegaat en past bij uw situatie. Bekijk hieronder al onze diensten.
          </p>
        </div>
      </section>

      <Section>
        <SectionHeading title="Alle diensten" intro="Klik op een dienst voor meer informatie." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  )
}
