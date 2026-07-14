import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { CallToAction } from "@/components/sections/CallToAction";
import type { CtaContent, Service } from "@/types/content";

interface ServicePageTemplateProps {
  service: Service;
  metaDescription: string;
  cta: CtaContent;
  /** Optional extra verified content rendered before the CTA. */
  children?: ReactNode;
}

/**
 * Shared layout for the service detail pages. Renders the verified intro
 * paragraphs and highlight points from the service data — no invented copy.
 */
export function ServicePageTemplate({
  service,
  metaDescription,
  cta,
  children,
}: ServicePageTemplateProps) {
  return (
    <>
      <SEO title={service.title} description={metaDescription} />
      <PageHero
        eyebrow="Ons aanbod"
        title={service.title}
        subtitle={service.summary}
        breadcrumbs={[{ label: service.title }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="max-w-prose space-y-4 text-text-secondary">
            {service.intro?.map((p, i) => (
              <p key={i} className={i === 0 ? "text-lg text-text-primary" : undefined}>
                {p}
              </p>
            ))}
          </div>
          {service.points && service.points.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface-muted p-6">
              <SectionHeading as="h2" title="Goed om te weten" />
              <ul className="mt-4 space-y-3">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-text-primary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {children}

      <CallToAction content={cta} />
    </>
  );
}
