import { MapPin, Phone, Navigation } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { business, fullAddress, directionsUrl } from "@/data/business";

export function LocationContact() {
  return (
    <Section id="contact" ariaLabel="Locatie en contact">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Locatie & contact" title="Kom langs of neem contact op" />
          <ul className="mt-8 space-y-5">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cream" aria-hidden="true" />
              <div>
                <p className="font-semibold text-text-strong">Adres</p>
                <p className="text-text-body">{fullAddress}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-cream" aria-hidden="true" />
              <div>
                <p className="font-semibold text-text-strong">Telefoon</p>
                <a href={business.phone.href} className="text-text-body hover:text-cream">
                  {business.phone.display}
                </a>
              </div>
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="h-5 w-5" aria-hidden="true" /> Open in Google Maps
            </Button>
            <Button href={directionsUrl} target="_blank" rel="noopener noreferrer" variant="outline">
              <Navigation className="h-5 w-5" aria-hidden="true" /> Route
            </Button>
          </div>
        </div>

        {/* Map: static Google Maps embed via place query (no API key needed). */}
        <div className="overflow-hidden rounded-2xl border border-line shadow-soft">
          <iframe
            title={`Kaart — ${business.name}, ${business.city}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress + ", Nederland")}&output=embed`}
            className="h-full min-h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </Section>
  );
}
