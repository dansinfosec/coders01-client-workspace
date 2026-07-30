import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { getAvailableTimeSlots, type TimeSlot } from "@/lib/availability";
import { cn } from "@/utils/cn";

interface Props {
  locationId: string;
  date: string;
  selectedServices: string[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

/** Modern selectable time-slot buttons for the chosen date. */
export function TimeSlots({ locationId, date, selectedServices, selectedTime, onSelectTime }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const servicesKey = selectedServices.join(",");

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    let active = true;
    setLoading(true);
    setError(false);
    getAvailableTimeSlots(locationId, date, servicesKey ? servicesKey.split(",") : [])
      .then((res) => active && setSlots(res))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locationId, date, servicesKey]);

  if (!date) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-dashed border-line p-4 text-sm text-text-muted">
        <Clock className="h-4 w-4" /> Kies eerst een beschikbare datum.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 p-2 text-sm text-text-muted" aria-live="polite">
        <Loader2 className="h-4 w-4 animate-spin" /> Beschikbare tijden laden…
      </p>
    );
  }

  if (error) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-error/10 p-4 text-sm text-error">
        <AlertCircle className="h-4 w-4" /> Tijden konden niet worden geladen. Probeer het opnieuw.
      </p>
    );
  }

  const hasAvailable = slots.some((s) => s.available);
  if (!hasAvailable) {
    return (
      <p className="rounded-lg border border-line bg-surface-muted p-4 text-sm text-text-body">
        Geen beschikbare tijden op deze dag. Kies een andere datum.
      </p>
    );
  }

  return (
    <div role="group" aria-label="Beschikbare tijden" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        return (
          <button
            key={slot.time}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={!slot.available}
            aria-label={`${slot.time}${slot.available ? "" : ", niet beschikbaar"}`}
            onClick={() => onSelectTime(slot.time)}
            className={cn(
              "rounded-lg border-2 py-2.5 text-center font-mono text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1",
              !slot.available && "cursor-not-allowed border-line bg-surface-muted text-text-muted/50 line-through",
              slot.available && !isSelected && "border-line bg-surface text-text-strong hover:border-ink/40",
              isSelected && "border-mark bg-mark text-white",
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
