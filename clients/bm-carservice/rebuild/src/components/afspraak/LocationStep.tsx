import { MapPin, Clock, Check, Star } from "lucide-react";
import { locations, locationAddressLine } from "@/data/locations";
import { weekSummary } from "@/lib/openingHours";
import { cn } from "@/utils/cn";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

/** Step 0 — choose a branch. Required before continuing. */
export function LocationStep({ selected, onSelect }: Props) {
  return (
    <section aria-labelledby="vestiging-heading">
      <h2 id="vestiging-heading" className="text-xl">Bij welke vestiging wilt u langskomen?</h2>
      <p className="mt-1 text-sm text-text-muted">Kies een vestiging om verder te gaan.</p>

      <div role="radiogroup" aria-label="Vestiging" className="mt-6 grid gap-4 md:grid-cols-3">
        {locations.map((loc) => {
          const isSelected = selected === loc.id;
          return (
            <button
              key={loc.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(loc.id)}
              className={cn(
                "flex h-full flex-col rounded-2xl border-2 p-5 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
                isSelected ? "border-mark bg-mark/5 shadow-card" : "border-line bg-surface hover:border-ink/30 hover:shadow-card",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-lg font-bold text-text-strong">{loc.city}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    isSelected ? "border-mark bg-mark text-white" : "border-ink/25 text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="mt-0.5 text-sm text-text-muted">{loc.name}</span>

              {loc.isPlaceholder && (
                <span className="mt-3 inline-flex w-fit items-center bg-signal px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wide text-ink">
                  Demovestiging · nog te bevestigen
                </span>
              )}

              <ul className="mt-3 space-y-1.5 text-sm text-text-body">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mark" /> {locationAddressLine(loc)}
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mark" /> {weekSummary(loc.openingHours)}
                </li>
                {loc.specialties?.[0] && (
                  <li className="flex items-start gap-2">
                    <Star className="mt-0.5 h-4 w-4 shrink-0 text-mark" /> {loc.specialties[0]}
                  </li>
                )}
              </ul>
            </button>
          );
        })}
      </div>
    </section>
  );
}
