import Seo from '../components/Seo.jsx'
import Section, { SectionHeading } from '../components/Section.jsx'
import ProcessSteps from '../components/ProcessSteps.jsx'
import CtaBanner from '../components/CtaBanner.jsx'
import { company, reasons } from '../data/company.js'

export default function OverOns() {
  return (
    <>
      <Seo
        title="Over ons"
        description="Al meer dan 25 jaar staat HK Vastgoed & Onderhoud klaar met vakmanschap, betrouwbaarheid en kwaliteit. Wat begon als familiebedrijf is nu een vertrouwde partner."
      />

      {/* Intro */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow mb-2">Over HK Vastgoed &amp; Onderhoud</p>
            <h1 className="text-4xl font-extrabold sm:text-5xl">Wie zijn wij?</h1>
            <div className="prose-block mt-6 max-w-none">
              <p>
                Bij HK Vastgoed &amp; Onderhoud draait alles om vakmanschap, betrouwbaarheid en
                kwaliteit. Al meer dan 25 jaar staan wij klaar voor onze klanten met een brede
                expertise in dakwerken en onderhoud. Wat ooit begon als een klein familiebedrijf is
                inmiddels uitgegroeid tot een betrouwbare partner voor particulieren en bedrijven.
              </p>
              <p>
                Wij begrijpen dat een goed dak en degelijk onderhoud het verschil maken. Daarom
                combineren we jarenlange ervaring met moderne technieken en duurzame materialen. Of
                het nu gaat om een kleine reparatie of een complete renovatie: wij zorgen voor een
                oplossing die lang meegaat en past bij uw situatie.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img src="/images/team-at-work.jpg" alt="Vakmensen van HK Vastgoed & Onderhoud aan het werk" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </Section>

      {/* Our strength / personal approach */}
      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 overflow-hidden rounded-2xl shadow-card lg:order-1">
            <img src="/images/about-portrait.jpg" alt="Dakdekker van HK Vastgoed & Onderhoud" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow="Onze kracht" title="Een persoonlijke aanpak" />
            <div className="prose-block max-w-none">
              <p>
                Bij HK Vastgoed &amp; Onderhoud geloven we dat geen enkel dak en geen enkel pand
                hetzelfde is. Daarom nemen we altijd de tijd om mee te denken en advies te geven dat
                écht bij u past. We werken transparant, houden van korte lijnen en zorgen dat u
                altijd weet waar u aan toe bent.
              </p>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {company.certifications.map((c) => (
                <li key={c} className="rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-medium text-brand-700">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Reasons */}
      <Section>
        <SectionHeading eyebrow="Waarom HK?" title="Waarom klanten voor ons kiezen" center />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <li key={r.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="text-base font-bold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{r.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Process */}
      <Section tone="muted">
        <SectionHeading eyebrow="Werkwijze" title="Zo gaan we te werk" center />
        <ProcessSteps />
      </Section>

      <CtaBanner />
    </>
  )
}
