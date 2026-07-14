import { Button } from "@/components/ui/Button";
import { Section } from "@/components/sections/Section";
import type { CtaContent } from "@/types/content";

interface CallToActionProps {
  content: CtaContent;
}

/** A calm closing call-to-action band with primary + optional secondary link. */
export function CallToAction({ content }: CallToActionProps) {
  return (
    <Section tone="brand" spacing="md" ariaLabel="Oproep tot actie">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-prose">
          <h2 className="text-2xl sm:text-3xl text-text-primary">{content.title}</h2>
          <p className="mt-2 text-text-secondary">{content.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button to={content.primaryTo} size="lg">
            {content.primaryLabel}
          </Button>
          {content.secondaryLabel && content.secondaryTo && (
            <Button to={content.secondaryTo} variant="secondary" size="lg">
              {content.secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
