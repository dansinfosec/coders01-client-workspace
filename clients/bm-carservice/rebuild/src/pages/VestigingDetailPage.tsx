import { useParams } from "react-router-dom";
import { MapPin, Phone, Mail, MessageCircle, ExternalLink, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { LocationMap } from "@/components/sections/LocationMap";
import { LocationStructuredData } from "@/components/LocationStructuredData";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { getLocation, locationAddressLine } from "@/data/locations";
import { werkzaamheidLabel } from "@/data/werkzaamheden";
import { NotFoundPage } from "./NotFoundPage";

export function VestigingDetailPage() {
  const { slug } = useParams();
  const loc = getLocation(slug ?? "");
  if (!loc) return <NotFoundPage />;

  const tel = loc.whatsapp ? `tel:+${loc.whatsapp}` : undefined;
  const wa = loc.whatsapp ? `https://wa.me/${loc.whatsapp}` : undefined;

  return (
    <>
      <SEO
        title={`BM Carservice ${loc.city} — APK, onderhoud & reparatie`}
        description={`BM Carservice in ${loc.city}: ${loc.isPlaceholder ? "binnenkort meer informatie" : locationAddressLine(loc)}. Bekijk openingstijden en diensten en plan online een afspraak.`}
        path={`/vestigingen/${loc.slug}`}
      />
      <LocationStructuredData location={loc} />
      <PageHero
        eyebrow="Vestiging"
        title={`BM Carservice ${loc.city}`}
        intro={loc.isPlaceholder
          ? "Deze vestiging wordt binnenkort toegevoegd. De gegevens worden nog bevestigd."
          : `Uw vakgarage in ${loc.city} voor APK, onderhoud, banden en reparatie.`}
        crumbs={[{ label: "Home", to: "/" }, { label: "Vestigingen", to: "/vestigingen" }, { label: loc.city }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button to={`/afspraak-maken?vestiging=${loc.slug}`} variant="mark">Plan een afspraak</Button>
          {loc.googleMapsUrl && (
            <Button href={loc.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="onInk">
              <ExternalLink className="h-4 w-4" /> Route
            </Button>
          )}
        </div>
      </PageHero>

      <Section tone="default">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Details */}
          <div className="space-y-6 lg:col-span-5">
            {loc.isPlaceholder && (
              <div className="rounded-xl border border-signal bg-signal/15 px-4 py-3 text-sm text-text-strong">
                Demovestiging — adres en contactgegevens worden nog met de klant bevestigd.
              </div>
            )}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
              <h2 className="text-xl">Contact &amp; adres</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-mark" /> {locationAddressLine(loc)}
                </li>
                {loc.phone && tel && (
                  <li className="flex items-center gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-mark" />
                    <a href={tel} className="font-semibold hover:text-mark-strong">{loc.phone}</a>
                  </li>
                )}
                {wa && (
                  <li className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 shrink-0 text-mark" />
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-mark-strong">WhatsApp</a>
                  </li>
                )}
                {loc.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-mark" />
                    <a href={`mailto:${loc.email}`} className="hover:text-mark-strong">{loc.email}</a>
                  </li>
                )}
              </ul>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Button to={`/afspraak-maken?vestiging=${loc.slug}`} variant="mark" className="w-full">Afspraak maken</Button>
                {loc.googleMapsUrl && (
                  <Button href={loc.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="outline" className="w-full">Route</Button>
                )}
              </div>
            </div>
            <OpeningHours hours={loc.openingHours} />
          </div>

          {/* Map */}
          <div className="lg:col-span-7">
            <LocationMap location={loc} className="h-full min-h-[26rem] overflow-hidden rounded-2xl border border-line" />
          </div>
        </div>

        {/* Services + specialties */}
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">Diensten in {loc.city}</h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {loc.services.filter((s) => s !== "anders").map((id) => (
                <li key={id} className="flex items-center gap-2 text-sm text-text-body">
                  <Check className="h-4 w-4 shrink-0 text-pass" /> {werkzaamheidLabel(id)}
                </li>
              ))}
            </ul>
          </div>
          {loc.specialties && loc.specialties.length > 0 && (
            <div>
              <h2 className="text-2xl">Specialisaties</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {loc.specialties.map((s) => (
                  <Tag key={s} tone="outline">{s}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
      <CTASection />
    </>
  );
}
