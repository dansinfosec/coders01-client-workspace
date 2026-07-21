import { Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { company } from "@/data/company";

const reasons = [
  "Kosteloze en vrijblijvende dakinspectie",
  "Ervaren team, VCA-gecertificeerd",
  "Duidelijke offerte op maat",
];

export function OffertePage() {
  return (
    <>
      <SEO
        title="Offerte aanvragen | All-in Daktechniek"
        description="Vraag vrijblijvend een offerte aan bij All-in Daktechniek. Vul het formulier in of bel of app ons direct. Wij nemen zo snel mogelijk contact met u op."
        path="/offerte"
      />
      <PageHero
        eyebrow="Offerte"
        title="Vraag vrijblijvend een offerte aan"
        intro="Vul het formulier zo volledig mogelijk in. Liever direct contact? Bel of app ons."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <QuoteForm />
          </div>
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-line bg-surface-muted p-6">
              <h2 className="text-lg">Liever direct contact?</h2>
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href={company.phonePrimary.href}
                  className="inline-flex items-center gap-2 font-semibold text-green-strong hover:underline"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  {company.phonePrimary.display}
                </a>
                <a
                  href={company.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-green-strong hover:underline"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Stuur een WhatsApp
                </a>
              </div>
              <ul className="mt-6 space-y-2 border-t border-line pt-4">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-text-body">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-strong" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
