import { Phone, MessageCircle, MessageSquareText } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useAssistant } from "@/features/assistant/AssistantContext";
import { company, contact, telLink, whatsappLink } from "@/data/company";
import { ROUTES } from "@/routes/paths";

interface CTASectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  /** Show call/WhatsApp buttons prominently (for the leakage-focused CTA). */
  urgent?: boolean;
}

/** Reusable navy call-to-action band. Contact channels only appear when configured. */
export function CTASection({ eyebrow, title, description, urgent = false }: CTASectionProps) {
  const { openAssistant } = useAssistant();
  return (
    <Section tone="navy" spacing="md">
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="eyebrow text-green">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-green" />
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-2xl font-bold text-text-invert sm:text-3xl">{title}</h2>
          <p className="mt-2 text-text-invert/80">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {urgent && contact.hasPhone && (
            <Button href={telLink()} size="lg">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {company.cta.call}
            </Button>
          )}
          {urgent && contact.hasWhatsapp && (
            <Button href={whatsappLink("Ik heb een daklekkage.")} target="_blank" rel="noopener noreferrer" size="lg" variant="onNavy">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </Button>
          )}
          {(!urgent || (!contact.hasPhone && !contact.hasWhatsapp)) && (
            <Button to={ROUTES.offerte} size="lg">
              {company.cta.primary}
            </Button>
          )}
          <Button type="button" onClick={openAssistant} size="lg" variant="onNavy">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            {company.cta.assistant}
          </Button>
        </div>
      </div>
    </Section>
  );
}
