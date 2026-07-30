import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { company } from "@/data/company";
import { locations, locationAddressLine } from "@/data/locations";

// Verified facts from the live site (crawl 2026-07-30) — nothing invented.
const feiten = [
  "RDW-erkende keuringsinstantie: wij keuren zelf en melden af bij de RDW",
  "Erkend ANWB Partnerbedrijf, pechhulp conform de Wegenwacht-standaard",
  "Officieel leverancier van TOTAL motorolie",
  "Werkplaats met vijf bruggen, remmentestbank en uitlijnapparatuur",
  "Diagnose met AUTEL-apparatuur voor alle merken",
  "A-kwaliteit onderdelen: Bosch, Brembo, Valeo, Gates, NGK en meer",
  "36 maanden garantie op reparaties; 12 maanden op koppeling en distributieketting",
];

export function OverOnsPage() {
  return (
    <>
      <SEO
        title="Over BM Carservice — vakgarage in Amstelveen"
        description="BM Carservice is een onafhankelijke vakgarage voor alle merken: RDW-erkend, ANWB-partnerbedrijf, A-kwaliteit onderdelen en eerlijke prijzen. Lees meer over ons."
        path="/over-ons"
      />
      <PageHero
        eyebrow="Over ons"
        title="Uw veiligheid is ons beroep"
        intro={company.intro}
        crumbs={[{ label: "Home", to: "/" }, { label: "Over BM Carservice" }]}
      />
      <TrustStrip />

      <Section tone="default">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Wie we zijn"
              title="Een onafhankelijke vakgarage voor alle merken"
              intro="We combineren vakmanschap met moderne kennis en apparatuur. Reparaties overleggen we altijd vooraf — geen verrassingen, eerlijke prijzen en werk dat klopt."
            />
          </div>
          <ul className="space-y-2.5">
            {feiten.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-signal">
                  <Check className="h-4 w-4 text-ink" />
                </span>
                <span className="text-text-body">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Vestigingen" title="Waar u ons vindt" className="mb-8" />
        <ul className="grid gap-4 md:grid-cols-3">
          {locations.map((loc) => (
            <li key={loc.id}>
              <Link
                to={`/vestigingen/${loc.slug}`}
                className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 hover:border-ink/30 hover:shadow-card"
              >
                <span className="font-display text-lg font-bold text-text-strong">{loc.city}</span>
                <span className="mt-1 flex-1 text-sm text-text-body">{locationAddressLine(loc)}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mark-strong">
                  Bekijk vestiging <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection />
    </>
  );
}
