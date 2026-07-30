import { MapPin, ExternalLink } from "lucide-react";
import type { Location } from "@/data/locations";
import { Button } from "@/components/ui/Button";

/**
 * Google Maps for a branch — lazily loaded (native iframe lazy-loading). When no verified
 * embed URL exists yet, shows a neat placeholder with a working external route button.
 */
export function LocationMap({ location, className }: { location: Location; className?: string }) {
  const wrap = className ?? "h-full min-h-[22rem] overflow-hidden rounded-2xl border border-line";

  if (location.mapEmbedUrl) {
    return (
      <div className={wrap}>
        <iframe
          title={`Locatie ${location.name}`}
          src={location.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full min-h-[22rem] w-full"
        />
      </div>
    );
  }

  return (
    <div className={`${wrap} grid place-items-center bg-surface-muted p-6 text-center`}>
      <div>
        <MapPin className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm text-text-body">
          Kaart voor {location.city} wordt toegevoegd zodra het adres is bevestigd.
        </p>
        {location.googleMapsUrl && (
          <div className="mt-4">
            <Button href={location.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" /> Zoek op Google Maps
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
