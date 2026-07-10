import Button from './Button.jsx'
import WhatsAppButton from './WhatsAppButton.jsx'
import { company } from '../data/company.js'

// Final conversion CTA reused at the bottom of most pages. Dark charcoal band
// with a brand-green accent panel for a premium, focused close.
export default function CtaBanner({
  title = 'Klaar voor een dak zonder zorgen?',
  text = 'Vraag een gratis en vrijblijvende dakinspectie aan. U ontvangt een heldere offerte zonder kleine lettertjes en beslist zelf of en wanneer we aan de slag gaan.',
}) {
  return (
    <section className="relative overflow-hidden bg-charcoal-900">
      {/* Subtle brand glow accents. */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" aria-hidden="true" />
      <div className="container-content relative py-16 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3 text-brand-300">Aan de slag</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 text-lg text-white/75">{text}</p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
            <Button to="/offerte" className="px-6 py-4 text-base">
              Vraag gratis dakinspectie aan
            </Button>
            <Button href={company.phone.href} variant="ghost" className="px-6 py-4 text-base">
              Bel {company.phone.display}
            </Button>
            <WhatsAppButton className="px-6 py-4 text-base" />
          </div>
        </div>
      </div>
    </section>
  )
}
