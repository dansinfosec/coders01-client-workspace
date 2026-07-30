import { Link } from "react-router-dom";
import { MapPin, Clock, Phone, ArrowRight, ExternalLink } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { locations, locationAddressLine } from "@/data/locations";
import { weekSummary } from "@/lib/openingHours";

export function VestigingenPage() {
  return (
    <>
      <SEO
        title="Vestigingen — BM Carservice"
        description="De vestigingen van BM Carservice. Bekijk adres, openingstijden en contactgegevens per vestiging en plan direct een afspraak bij u in de buurt."
        path="/vestigingen"
      />
      <PageHero
        eyebrow="Vestigingen"
        title="Onze vestigingen"
        intro="Kies de vestiging die u het beste uitkomt. Bekijk de gegevens of plan direct een afspraak."
        crumbs={[{ label: "Home", to: "/" }, { label: "Vestigingen" }]}
      />
      <Section tone="default">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => {
            const tel = loc.whatsapp ? `tel:+${loc.whatsapp}` : undefined;
            return (
              <li key={loc.id} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold text-text-strong">{loc.city}</h2>
                    <p className="text-sm text-text-muted">{loc.name}</p>
                  </div>
                  {loc.isPlaceholder && (
                    <span className="shrink-0 bg-signal px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wide text-ink">
                      Nog te bevestigen
                    </span>
                  )}
                </div>

                <ul className="mt-4 space-y-2 text-sm text-text-body">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mark" /> {locationAddressLine(loc)}
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mark" /> {weekSummary(loc.openingHours)}
                  </li>
                  {loc.phone && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-mark" /> {loc.phone}
                    </li>
                  )}
                </ul>

                <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {tel ? (
                      <Button href={tel} variant="outline" size="sm"><Phone className="h-4 w-4" /> Bellen</Button>
                    ) : (
                      <Button to={`/vestigingen/${loc.slug}`} variant="outline" size="sm">Contact</Button>
                    )}
                    {loc.googleMapsUrl && (
                      <Button href={loc.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" /> Route
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button to={`/vestigingen/${loc.slug}`} variant="ink" size="sm">Bekijk vestiging</Button>
                    <Button to={`/afspraak-maken?vestiging=${loc.slug}`} variant="mark" size="sm">Plan afspraak</Button>
                  </div>
                </div>

                <Link
                  to={`/vestigingen/${loc.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mark-strong"
                >
                  Meer over deze vestiging <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
      <CTASection />
    </>
  );
}
