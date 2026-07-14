import { Mail, MapPin, Phone } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";
import { contactDetails } from "@/data/contactDetails";

/** Contact page (route "/contact"). Verified address; unverified channels hidden. */
export function ContactPage() {
  const { organisation, locationName, email, phone, address } = contactDetails;

  return (
    <>
      <SEO
        title="Contact"
        description="Neem contact op met Sem & Co om de mogelijkheden voor logeer-, vakantie- of crisisopvang te bespreken."
      />
      <PageHero
        eyebrow="Contact"
        title="Neem contact op"
        subtitle="Vragen of benieuwd of Sem & Co past? Stuur een bericht of kom langs op onze locatie in Doorn."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Details */}
          <div>
            <SectionHeading title="Gegevens" />
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Bezoekadres</p>
                  <address className="text-sm not-italic text-text-secondary">
                    {organisation} — {locationName}
                    <br />
                    {address.street}
                    <br />
                    {address.postalCode} {address.city}
                  </address>
                </div>
              </li>

              {/* Phone / e-mail are only shown when verified (no fake values). */}
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Telefoon</p>
                    <a
                      href={`tel:${phone.replace(/\s|\(|\)/g, "")}`}
                      className="text-sm text-text-secondary hover:text-brand hover:underline"
                    >
                      {phone}
                    </a>
                  </div>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">E-mail</p>
                    <a
                      href={`mailto:${email}`}
                      className="text-sm text-text-secondary hover:text-brand hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                </li>
              )}

              {(!phone || !email) && (
                <li className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
                  Telefoonnummer en e-mailadres worden nog bevestigd. Gebruik zolang
                  het contactformulier hiernaast.
                </li>
              )}
            </ul>
          </div>

          {/* Form */}
          <div>
            <SectionHeading title="Stuur een bericht" />
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
