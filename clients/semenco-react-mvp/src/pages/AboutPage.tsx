import { Info } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { CallToAction } from "@/components/sections/CallToAction";
import { aboutContent } from "@/data/aboutContent";
import { imageAssets } from "@/data/imageAssets";
import { ROUTES } from "@/routes/paths";

/** "Over ons" page (route "/over-ons"). Verified content only. */
export function AboutPage() {
  const { intro, approach, smallScale, toConfirmNote } = aboutContent;

  return (
    <>
      <SEO
        title="Over ons"
        description="Sem & Co is een warme, huiselijke en kleinschalige logeerplek voor kinderen en jongeren met extra ondersteuningsbehoeften op RCN Het Grote Bos in Doorn."
      />
      <PageHero
        eyebrow="Over ons"
        title="Over Sem & Co"
        subtitle="Een warme, huiselijke plek waar kinderen zichzelf kunnen zijn — bewust kleinschalig en met echte aandacht."
        breadcrumbs={[{ label: "Over ons" }]}
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div className="max-w-prose space-y-4 text-text-secondary">
            {intro.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "text-lg text-text-primary" : undefined}>
                {p}
              </p>
            ))}
          </div>
          <img
            src={imageAssets.homeHero.src}
            alt={imageAssets.homeHero.alt}
            width={imageAssets.homeHero.width}
            height={imageAssets.homeHero.height}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-soft"
          />
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-10 sm:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading title={smallScale.heading} />
            <div className="mt-4 space-y-4 text-text-secondary">
              {smallScale.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading title={approach.heading} />
            <div className="mt-4 space-y-4 text-text-secondary">
              {approach.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section spacing="md">
        <p className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4 text-sm text-text-secondary">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <span>{toConfirmNote}</span>
        </p>
      </Section>

      <CallToAction
        content={{
          title: "Kennismaken met Sem & Co?",
          description: "Aanmelden is vrijblijvend. We leren jullie graag rustig kennen.",
          primaryLabel: "Aanmelden",
          primaryTo: ROUTES.aanmelden,
          secondaryLabel: "Neem contact op",
          secondaryTo: ROUTES.contact,
        }}
      />
    </>
  );
}
