import { Phone, MessageCircle, Mail, MapPin, Building2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";
import { company, fullAddress } from "@/data/company";
import { ROUTES } from "@/routes/paths";

export function ContactPage() {
  return (
    <>
      <SEO
        title="Contact | All-in Daktechniek"
        description="Neem contact op met All-in Daktechniek in Honselersdijk. Bel 06 53252125, app of mail info@all-indaktechniek.nl. Wij helpen u graag met uw dak."
        path="/contact"
      />
      <PageHero
        eyebrow="Contact"
        title="Neem contact op"
        intro="Heeft u interesse in een van onze diensten of wilt u meer informatie? Twijfel niet om contact op te nemen."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">Gegevens</h2>
            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-text-strong">Adres</p>
                  <p className="text-text-body">{fullAddress}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-text-strong">Telefoon</p>
                  <p className="text-text-body">
                    <a href={company.phonePrimary.href} className="hover:text-green-strong">{company.phonePrimary.display}</a>
                    {" · "}
                    <a href={company.phoneSecondary.href} className="hover:text-green-strong">{company.phoneSecondary.display}</a>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-text-strong">E-mail</p>
                  <a href={`mailto:${company.email}`} className="text-text-body hover:text-green-strong">{company.email}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-text-strong">KvK</p>
                  <p className="text-text-body">{company.kvk}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={company.phonePrimary.href} size="lg">
                <Phone className="h-5 w-5" aria-hidden="true" />
                Bel ons
              </Button>
              <Button href={company.whatsapp.href} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-muted p-6 sm:p-8">
            <h2 className="text-2xl">Offerte aanvragen</h2>
            <p className="mt-3 text-text-body">
              Wilt u een prijsopgave? Vul het offerteformulier in, dan hebben wij meteen alle
              gegevens om u goed te kunnen helpen.
            </p>
            <div className="mt-6">
              <Button to={ROUTES.offerte} size="lg">Naar het offerteformulier</Button>
            </div>
            <p className="mt-6 border-t border-line pt-4 text-sm text-text-muted">
              Openingstijden worden hier getoond zodra deze door de klant zijn bevestigd.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
