import { Wrench, HeartHandshake, Mail, Phone, Info, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { breadcrumbSchema } from "@/lib/structuredData";

const redenen = [
  "Een onafhankelijke vakgarage met vaste klanten sinds 2000",
  "Afwisselend werk aan alle merken — onderhoud, APK, uitlaat- en laswerk",
  "Een hecht team met persoonlijke aandacht en korte lijnen",
];

export function VacaturePage() {
  const subject = encodeURIComponent("Open sollicitatie — Fix-it All");

  return (
    <>
      <SEO
        title="Vacatures & open sollicitatie — werken bij Fix-it All"
        description="Werken bij Autobedrijf Fix-it All in Utrecht? Wij staan altijd open voor gemotiveerde monteurs en collega's. Stuur een open sollicitatie."
        path="/vacatures"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Vacatures", path: "/vacatures" },
        ])}
      />

      <PageHero
        eyebrow="Vacatures"
        title="Werken bij Fix-it All"
        intro="Versterk ons team in Utrecht. Ook zonder actuele vacature ontvangen we graag uw open sollicitatie."
        crumbs={[{ label: "Home", to: "/" }, { label: "Vacatures" }]}
      />

      <Section tone="paper" size="lg">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="max-w-prose">
              <h2 className="font-display text-2xl font-bold text-text-strong">Altijd op zoek naar vakmensen</h2>
              <p className="mt-4 leading-relaxed text-text-body">
                Bij Fix-it All werken gediplomeerde monteurs met hart voor het vak. Groeit ons werk, dan groeit ons
                team mee. Bent u monteur, (aankomend) APK-keurmeester of wilt u op een andere manier bijdragen? Wij
                komen graag met u in contact — ook als er op dit moment geen specifieke vacature online staat.
              </p>

              <h3 className="mt-8 font-display text-lg font-bold text-text-strong">Waarom Fix-it All</h3>
              <ul className="mt-4 space-y-3">
                {redenen.map((r) => (
                  <li key={r} className="flex gap-3 text-text-body">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-petrol" aria-hidden /> {r}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-status-reserved/30 bg-status-reserved/10 px-4 py-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-reserved" aria-hidden />
                <p className="text-sm text-text-body">
                  Er staan op dit moment geen specifieke, ingevulde vacatures op deze pagina. Concrete functies,
                  eisen en arbeidsvoorwaarden voegen we toe zodra ze bekend zijn.
                  {" "}
                  <span className="text-text-muted">(TODO: openstaande functies en voorwaarden bevestigen met de klant.)</span>
                </p>
              </div>
            </div>

            {/* Sollicitatiekaart */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-petrol-soft text-petrol-strong">
                  <Wrench className="h-6 w-6" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold text-text-strong">Stuur een open sollicitatie</h2>
                <p className="mt-1.5 text-sm text-text-muted">
                  Vertel kort wie u bent en wat u zoekt. Wij nemen persoonlijk contact met u op.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button href={`mailto:${company.email}?subject=${subject}`} block>
                    <Mail className="h-4 w-4" aria-hidden /> Mail uw sollicitatie
                  </Button>
                  <Button href={company.phone.href} variant="outline" block>
                    <Phone className="h-4 w-4" aria-hidden /> {company.phone.display}
                  </Button>
                </div>
                <p className="mt-4 flex items-start gap-2 text-xs text-text-muted">
                  <HeartHandshake className="mt-0.5 h-3.5 w-3.5 shrink-0 text-petrol" aria-hidden />
                  We behandelen uw gegevens vertrouwelijk en gebruiken ze alleen voor uw sollicitatie.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
