import { CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { ROUTES } from "@/routes/paths";

const points = [
  "Vertel kort wat er speelt met uw platte dak",
  "Voeg desgewenst foto's toe",
  "U ontvangt advies na inspectie op locatie",
  "Vrijblijvend — u zit nergens aan vast",
];

export function OffertePage() {
  return (
    <>
      <SEO
        title="Offerte of dakinspectie aanvragen"
        description="Vraag vrijblijvend een offerte of dakinspectie aan voor uw platte dak in Almere en omgeving. Beschrijf uw situatie en voeg foto's toe."
        path={ROUTES.offerte}
      />
      <PageHero eyebrow="Offerte / inspectie" title="Vraag een offerte of inspectie aan" subtitle="Vul het formulier in. We beoordelen uw aanvraag en nemen contact met u op." />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <aside className="lg:pt-2">
            <h2 className="text-lg font-bold text-text-strong">Zo werkt het</h2>
            <ul className="mt-4 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-text-body">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />{p}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-line bg-surface-muted px-4 py-3 text-xs text-text-muted">
              Dit is een demoformulier. Er is nog geen backend gekoppeld, dus er wordt geen e-mail verstuurd.
            </p>
          </aside>
          <div><QuoteForm /></div>
        </div>
      </Section>
    </>
  );
}
