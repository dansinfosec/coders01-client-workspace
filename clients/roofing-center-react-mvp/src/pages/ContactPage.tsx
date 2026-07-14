import { MapPin, Phone, Mail, MessageCircle, MessageSquareText, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAssistant } from "@/features/assistant/AssistantContext";
import { company, contact, telLink, whatsappLink } from "@/data/company";
import { ROUTES } from "@/routes/paths";

export function ContactPage() {
  const { openAssistant } = useAssistant();
  return (
    <>
      <SEO
        title="Contact"
        description="Neem contact op met Roofing Center voor uw platte dak in Almere en omgeving. Vraag een offerte of dakinspectie aan of gebruik de dakassistent."
        path={ROUTES.contact}
      />
      <PageHero eyebrow="Contact" title="Neem contact op" subtitle="Vragen of benieuwd naar de mogelijkheden voor uw platte dak? We denken graag met u mee." />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading title="Gegevens" />
            <ul className="mt-6 space-y-4 text-sm text-text-body">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                <div><p className="font-medium text-text-strong">Werkgebied</p>{company.serviceAreaLong}</div>
              </li>
              {contact.hasPhone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                  <div><p className="font-medium text-text-strong">Telefoon</p><a href={telLink()} className="hover:text-green-strong">{company.phoneDisplay || company.phone}</a></div>
                </li>
              )}
              {contact.hasEmail && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                  <div><p className="font-medium text-text-strong">E-mail</p><a href={`mailto:${company.email}`} className="hover:text-green-strong">{company.email}</a></div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                <div><p className="font-medium text-text-strong">Bereikbaarheid</p>Op afspraak</div>
              </li>
            </ul>

            {(!contact.hasPhone || !contact.hasEmail) && (
              <p className="mt-6 rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-text-muted">
                Telefoonnummer, e-mailadres en adres worden nog bevestigd door Roofing Center. Gebruik zolang het
                offerteformulier of de dakassistent — dan nemen we contact met u op.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {contact.hasPhone && <Button href={telLink()}><Phone className="h-4 w-4" aria-hidden="true" />{company.cta.call}</Button>}
              {contact.hasWhatsapp && <Button href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="outlineNavy"><MessageCircle className="h-4 w-4" aria-hidden="true" />WhatsApp</Button>}
            </div>
          </div>

          <Card className="flex flex-col">
            <h2 className="text-lg font-bold text-text-strong">Direct een aanvraag doen</h2>
            <p className="mt-2 text-sm text-text-muted">Kies wat het beste past. We beoordelen uw aanvraag en nemen contact met u op.</p>
            <div className="mt-5 flex flex-col gap-3">
              <Button to={ROUTES.offerte} size="lg">{company.cta.quote}</Button>
              <Button type="button" onClick={openAssistant} size="lg" variant="outlineNavy">
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />{company.cta.assistant}
              </Button>
            </div>
            {contact.hasMaps && (
              <a href={company.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-medium text-green-strong hover:underline">
                Bekijk op Google Maps
              </a>
            )}
          </Card>
        </div>
      </Section>
    </>
  );
}
