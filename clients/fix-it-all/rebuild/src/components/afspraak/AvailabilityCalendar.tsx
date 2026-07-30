import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  getAvailableDates,
  MAANDEN,
  WEEKDAGEN_KORT,
  mondayIndex,
  toIso,
  type DayStatus,
} from "@/services/planningService";
import { cn } from "@/utils/cn";

interface AvailabilityCalendarProps {
  services: string[];
  selectedDate: string | null;
  onSelect: (iso: string) => void;
}

export function AvailabilityCalendar({ services, selectedDate, onSelect }: AvailabilityCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const todayIso = toIso(today);
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());
  const [statuses, setStatuses] = useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getAvailableDates(year, month0, services).then((res) => {
      if (alive) {
        setStatuses(res);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [year, month0, services]);

  const isCurrentOrPastMonth = year === today.getFullYear() && month0 <= today.getMonth();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const leadingBlanks = mondayIndex(new Date(year, month0, 1).getDay());

  const prev = () => {
    if (isCurrentOrPastMonth) return;
    setMonth0((m) => (m === 0 ? 11 : m - 1));
    if (month0 === 0) setYear((y) => y - 1);
  };
  const next = () => {
    setMonth0((m) => (m === 11 ? 0 : m + 1));
    if (month0 === 11) setYear((y) => y + 1);
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      {/* Maandnavigatie */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={isCurrentOrPastMonth}
          aria-label="Vorige maand"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-body transition-colors hover:border-petrol hover:text-petrol disabled:cursor-not-allowed disabled:border-transparent disabled:text-text-muted/30 disabled:hover:text-text-muted/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <p className="font-display text-lg font-bold text-text-strong" aria-live="polite">
          {MAANDEN[month0]} <span className="text-text-muted">{year}</span>
        </p>
        <button
          type="button"
          onClick={next}
          aria-label="Volgende maand"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-body transition-colors hover:border-petrol hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Weekdagen */}
      <div className="grid grid-cols-7 gap-1 border-b border-line pb-2">
        {WEEKDAGEN_KORT.map((d) => (
          <div key={d} className="text-center font-mono text-2xs uppercase tracking-label text-text-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Dagen */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = toIso(new Date(year, month0, day));
          const status = statuses[iso] ?? "closed";
          const selectable = status === "available" || status === "limited";
          const isSelected = selectedDate === iso;
          const isToday = iso === todayIso;

          const cls = isSelected
            ? "bg-petrol text-white shadow-soft"
            : status === "available" || status === "limited"
              ? "text-text-strong hover:bg-petrol-soft/50 hover:text-petrol-strong"
              : status === "full"
                ? "text-text-muted/50 line-through cursor-not-allowed"
                : "text-text-muted/30 cursor-not-allowed";

          return (
            <button
              key={iso}
              type="button"
              disabled={!selectable}
              aria-pressed={isSelected}
              aria-label={`${day} ${MAANDEN[month0]}${status === "full" ? " — vol" : status === "closed" || status === "past" ? " — niet beschikbaar" : ""}`}
              onClick={() => selectable && onSelect(iso)}
              className={cn(
                "relative flex h-11 flex-col items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
                cls,
                isToday && !isSelected && "ring-1 ring-inset ring-petrol/40",
              )}
            >
              <span>{day}</span>
              {selectable && !isSelected && (
                <span
                  className={cn(
                    "mt-0.5 h-1 w-1 rounded-full",
                    status === "available" ? "bg-status-available" : "bg-status-reserved",
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="mt-3 flex items-center gap-2 font-mono text-2xs text-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Beschikbaarheid laden…
        </p>
      )}

      {/* Legenda */}
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3 font-mono text-2xs text-text-muted">
        <li className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-status-available" aria-hidden /> Beschikbaar
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-status-reserved" aria-hidden /> Bijna vol
        </li>
        <li className="flex items-center gap-1.5">
          <span className="text-text-muted/50 line-through">15</span> Vol
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm ring-1 ring-inset ring-petrol/40" aria-hidden /> Vandaag
        </li>
      </ul>
    </div>
  );
}
