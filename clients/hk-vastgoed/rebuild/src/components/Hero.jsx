import Button from './Button.jsx'
import { company, trustPoints } from '../data/company.js'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <img
        src="/images/hero.jpg"
        alt="Dakdekker van HK Vastgoed & Onderhoud aan het werk op een dak"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
        loading="eager"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/40" />

      <div className="container-content py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20">
            <span className="h-2 w-2 rounded-full bg-brand-400" />
            {company.responsePromise}
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
            Uw dak in vertrouwde handen
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            HK Vastgoed &amp; Onderhoud is uw dakdekker voor reparatie, renovatie, isolatie en
            onderhoud van platte en hellende daken. Vakmanschap, snelle service en duurzame
            oplossingen — met een gratis en vrijblijvende dakinspectie.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/offerte" className="px-6 py-3.5 text-base">
              Gratis dakinspectie aanvragen
            </Button>
            <Button href={company.phone.href} variant="ghost" className="px-6 py-3.5 text-base">
              Bel {company.phone.display}
            </Button>
          </div>

          <ul className="mt-10 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-white/90">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.1 0z" clipRule="evenodd" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
