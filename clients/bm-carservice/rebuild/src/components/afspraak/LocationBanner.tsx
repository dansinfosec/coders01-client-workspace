import { MapPin } from "lucide-react";
import { getLocation, locationAddressLine } from "@/data/locations";

/** Compact "your branch" banner shown on every step after the branch is chosen. */
export function LocationBanner({ locationId, onChange }: { locationId: string; onChange: () => void }) {
  const loc = getLocation(locationId);
  if (!loc) return null;
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3">
      <div className="flex items-start gap-2.5 text-sm">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mark" />
        <div>
          <span className="font-semibold text-text-strong">Uw vestiging: {loc.name}</span>
          <span className="block text-text-muted">{locationAddressLine(loc)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="text-sm font-semibold text-mark-strong underline underline-offset-2 hover:text-mark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      >
        Vestiging wijzigen
      </button>
    </div>
  );
}
