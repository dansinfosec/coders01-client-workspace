import Button from './Button.jsx'
import BackgroundVideo from './BackgroundVideo.jsx'
import { company, trustPoints } from '../data/company.js'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden text-white">
      <BackgroundVideo poster="/images/hero.jpg" alt="Dakdekker van HK Vastgoed & Onderhoud aan het werk op een dak" />
      {/* Layered overlays for readable text over the video/image. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal-950/95 via-charcoal-950/80 to-charcoal-950/40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal-950/80 via-transparent to-charcoal-950/30" />

      <div className="container-content py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            {company.responsePromise}
          </p>

          <h1 className="mt-6 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
            Vakkundig dakwerk dat
            <span className="text-brand-300"> jaren meegaat</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Reparatie, renovatie, isolatie en onderhoud van platte en hellende daken — door een
            gecertificeerde dakdekker met meer dan 25 jaar ervaring. Altijd een gratis dakinspectie
            en een heldere offerte vooraf.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/offerte" className="px-6 py-4 text-base">
              Vraag gratis dakinspectie aan
            </Button>
            <Button href={company.phone.href} variant="ghost" className="px-6 py-4 text-base">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Bel direct: {company.phone.display}
            </Button>
          </div>

          <ul className="mt-10 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-white/90">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
