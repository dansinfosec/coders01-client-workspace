import { Phone, Mail, MapPin, MessageCircle, LifeBuoy } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";

const whatsappUrl = `https://wa.me/${company.phone.whatsapp}`;
const mapEmbed =
  import.meta.env.VITE_MAPS_EMBED_URL ??
  `https://www.google.com/maps?q=${encodeURIComponent(
    `${company.name}, ${company.address.street}, ${company.address.postalCode} ${company.address.city}`,
  )}&output=embed`;

export function ContactPage() {
  return (
    <>
      <SEO
        title="Contact & route | BM Carservice Amstelveen"
        description="Contactgegevens, openingstijden en route naar BM Carservice, Bouwerij 69A in Amstelveen. Bel 020 – 345 1566 of stuur een WhatsApp."
        path="/contact"
      />
      <PageHero
        eyebrow="Contact"
        title="Kom langs of neem contact op"
        intro="U vindt ons aan de Bouwerij in Amstelveen. Bellen, WhatsApp of e-mail — we helpen u graag."
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />
      <Section tone="default">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Details */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
              <h2 className="text-xl">Contactgegevens</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-mark" />
                  <a href={company.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mark-strong">
                    {company.address.street}, {company.address.postalCode} {company.address.city}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-mark" />
                  <a href={company.phone.href} className="font-semibold hover:text-mark-strong">{company.phone.display}</a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 shrink-0 text-mark" />
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mark-strong">WhatsApp ons</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-mark" />
                  <a href={`mailto:${company.email}`} className="hover:text-mark-strong">{company.email}</a>
                </li>
                <li className="flex items-center gap-3">
                  <LifeBuoy className="h-5 w-5 shrink-0 text-mark" />
                  <span className="text-text-body">ANWB Alarmcentrale (pech): {company.anwbAlarm}</span>
                </li>
              </ul>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Button to="/afspraak" variant="mark" className="w-full">Afspraak maken</Button>
                <Button href={company.address.mapsUrl} target="_blank" rel="noopener noreferrer" variant="outline" className="w-full">
                  Route
                </Button>
              </div>
            </div>
            <OpeningHours />
          </div>

          {/* Map */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[24rem] overflow-hidden rounded-2xl border border-line">
              <iframe
                title={`Locatie ${company.name}`}
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[24rem] w-full"
              />
            </div>
          </div>
        </div>
      </Section>
      <CTASection />
    </>
  );
}
