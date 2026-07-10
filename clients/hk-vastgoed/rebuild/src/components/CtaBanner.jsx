import Button from './Button.jsx'
import { company } from '../data/company.js'

// Final conversion CTA reused at the bottom of most pages.
export default function CtaBanner({
  title = 'Klaar voor een dak zonder zorgen?',
  text = 'Vraag een gratis en vrijblijvende dakinspectie aan. U ontvangt een heldere offerte zonder kleine lettertjes en beslist zelf of en wanneer we aan de slag gaan.',
}) {
  return (
    <section className="bg-brand-700">
      <div className="container-content py-16">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 text-lg text-brand-50/90">{text}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button to="/offerte" variant="secondary" className="border-white bg-white px-6 py-3.5 text-base text-brand-700 hover:bg-brand-50">
              Offerte aanvragen
            </Button>
            <Button href={company.phone.href} variant="ghost" className="px-6 py-3.5 text-base">
              Bel {company.phone.display}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
