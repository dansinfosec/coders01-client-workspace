import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getAvailableTimeSlots, type TimeSlot } from "@/services/planningService";
import { cn } from "@/utils/cn";

interface TimeSlotsProps {
  date: string;
  services: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlots({ date, services, selectedTime, onSelect }: TimeSlotsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAvailableTimeSlots(date, services).then((res) => {
      if (alive) {
        setSlots(res);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [date, services]);

  if (loading) {
    return (
      <p className="flex items-center gap-2 font-mono text-2xs text-text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Tijden laden…
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-line bg-surface-muted px-4 py-3 text-sm text-text-muted">
        Geen tijden beschikbaar op deze dag. Kies een andere datum.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        // Wederzijds uitsluitende state-klassen — voorkomt conflicterende bg/text (wit-op-wit).
        const stateCls = !slot.available
          ? "cursor-not-allowed border-transparent bg-surface-muted text-text-muted/40 line-through"
          : isSelected
            ? "border-petrol bg-petrol text-white shadow-soft"
            : "border-line bg-surface text-text-strong hover:border-petrol hover:bg-petrol-soft/50 hover:text-petrol-strong";
        return (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            aria-pressed={isSelected}
            onClick={() => onSelect(slot.time)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-center font-mono text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
              stateCls,
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
