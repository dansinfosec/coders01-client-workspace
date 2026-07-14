import { CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTASection } from "@/components/sections/CTASection";
import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { services } from "@/data/services";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

export function DienstenPage() {
  return (
    <>
      <SEO
        title="Diensten voor platte daken"
        description="Bitumen dakbedekking, EPDM, renovatie, reparatie, lekkageherstel, dakinspectie, onderhoud en waterdicht maken van platte daken in Almere en omgeving."
        path={ROUTES.diensten}
      />
      <PageHero
        eyebrow="Diensten"
        title="Diensten voor platte daken"
        subtitle="Wij richten ons volledig op platte daken. Hieronder ziet u waar we u mee kunnen helpen."
        actions={<Button to={ROUTES.offerte}>{company.cta.primary}</Button>}
      />

      <Section>
        <div className="space-y-16">
          {services.map((s, i) => {
            const Icon = s.icon;
            const flip = i % 2 === 1;
            return (
              <article key={s.slug} id={s.slug} className="scroll-mt-24">
                <div className={cn("grid items-center gap-8 lg:grid-cols-2 lg:gap-12", flip && "lg:[&>div:first-child]:order-2")}>
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-soft text-green-strong">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 text-2xl font-bold text-text-strong">{s.title}</h2>
                    <div className="mt-3 space-y-3 text-text-muted">
                      {s.intro.map((p, idx) => <p key={idx}>{p}</p>)}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {s.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-text-body">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-strong" aria-hidden="true" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Img base={s.image.base} alt={s.image.alt} width={s.image.w} height={s.image.h}
                    className="aspect-[4/3] w-full rounded-2xl border border-line object-cover shadow-soft"
                    sizes="(min-width:1024px) 36rem, 90vw" />
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Werkwijze" title="Van aanvraag tot oplevering" />
        <div className="mt-10"><ProcessTimeline /></div>
      </Section>

      <CTASection
        eyebrow="Aan de slag"
        title="Benieuwd naar de mogelijkheden voor uw dak?"
        description="Vraag een vrijblijvende dakinspectie of offerte aan. We geven eerlijk advies over wat er nodig is."
      />
    </>
  );
}
