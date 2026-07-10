import Seo from '../components/Seo.jsx'
import Section from '../components/Section.jsx'
import ProjectGallery from '../components/ProjectGallery.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function Projecten() {
  return (
    <>
      <Seo
        title="Projecten"
        description="Bekijk recente projecten van HK Vastgoed & Onderhoud: dakrenovaties, platte daken, bitumen, nokvorsten en meer — uitgevoerd door onze eigen vakmensen."
      />

      <section className="border-b border-sand-200 bg-brand-50/60">
        <div className="container-content py-14 sm:py-16">
          <p className="eyebrow mb-2">Portfolio</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Onze recente werkzaamheden</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Een greep uit ons eigen werk. Deze foto’s komen rechtstreeks van onze projecten op
            locatie en geven een indruk van de kwaliteit en afwerking die u van ons mag verwachten.
          </p>
        </div>
      </section>

      <Section>
        <ProjectGallery />
      </Section>

      <CtaBanner
        title="Uw project als volgende?"
        text="Vertel ons waar u mee zit. We komen vrijblijvend langs, inspecteren uw dak en maken een heldere offerte op maat."
      />
    </>
  )
}
