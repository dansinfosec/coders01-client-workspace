import { CheckCircle2, Info } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/sections/CTASection";
import { Img } from "@/components/ui/Img";
import { Card } from "@/components/ui/Card";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

const values = [
  { title: "Gespecialiseerd", body: "We richten ons volledig op platte daken. Geen manusje-van-alles, maar gericht vakwerk." },
  { title: "Eerlijk advies", body: "Na inspectie vertellen we wat er nodig is — reparatie of renovatie. Zonder verrassingen." },
  { title: "Oog voor detail", body: "Op een plat dak zitten de risico's in de details: naden, opstanden, randen en doorvoeren." },
  { title: "Netjes werken", body: "We voeren het werk vakkundig uit en leveren het dak verzorgd op." },
];

export function OverOnsPage() {
  return (
    <>
      <SEO
        title="Over ons"
        description="Roofing Center is specialist in platte daken in Almere en omgeving. Bitumen en EPDM, met oog voor detail en eerlijk advies."
        path={ROUTES.overOns}
      />
      <PageHero eyebrow="Over ons" title="Specialist in platte daken" subtitle={`${company.claim}. Roofing Center werkt in ${company.serviceArea}.`} />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-prose space-y-4 text-text-muted">
            <p className="text-lg text-text-body">
              Roofing Center is gespecialiseerd in platte daken. We werken met bitumen en EPDM en zorgen voor een strak,
              waterdicht resultaat.
            </p>
            <p>
              Of het nu gaat om een nieuwe dakbedekking, een renovatie, een reparatie of het verhelpen van een lekkage: we
              beoordelen uw dak, geven eerlijk advies en voeren het werk vakkundig uit.
            </p>
            <p>Ons werkgebied is {company.serviceArea}.</p>
          </div>
          <Img base="projects/afgewerkt-membraandak" alt="Strak afgewerkt plat dak" width={1600} height={1201}
            className="aspect-[4/3] w-full rounded-2xl border border-line object-cover shadow-soft" sizes="(min-width:1024px) 36rem, 90vw" />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Waar we voor staan" title="Onze uitgangspunten" />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {values.map((v) => (
            <li key={v.title}>
              <Card className="h-full">
                <div className="flex items-center gap-2 font-bold text-text-strong">
                  <CheckCircle2 className="h-5 w-5 text-green-strong" aria-hidden="true" />{v.title}
                </div>
                <p className="mt-2 text-sm text-text-muted">{v.body}</p>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-text-muted">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
          Bedrijfsgegevens zoals team, ervaring en certificeringen worden op deze demo-website nog niet getoond. Deze worden
          toegevoegd zodra ze door Roofing Center zijn bevestigd.
        </p>
      </Section>

      <CTASection eyebrow="Kennismaken?" title="Benieuwd wat we voor uw dak kunnen doen?" description="Vraag een vrijblijvende inspectie of offerte aan." />
    </>
  );
}
