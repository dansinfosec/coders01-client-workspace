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

const statusStyle: Record<DayStatus, string> = {
  available: "bg-status-available/12 text-text-strong hover:bg-status-available/25 ring-1 ring-inset ring-status-available/30",
  limited: "bg-status-reserved/12 text-text-strong hover:bg-status-reserved/25 ring-1 ring-inset ring-status-reserved/30",
  full: "bg-surface-muted text-text-muted/60 cursor-not-allowed line-through",
  closed: "text-text-muted/35 cursor-not-allowed",
  past: "text-text-muted/25 cursor-not-allowed",
};

export function AvailabilityCalendar({ services, selectedDate, onSelect }: AvailabilityCalendarProps) {
  const today = useMemo(() => new Date(), []);
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
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={isCurrentOrPastMonth}
          aria-label="Vorige maand"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-body hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <p className="font-display text-base font-bold text-text-strong" aria-live="polite">
          {MAANDEN[month0]} {year}
        </p>
        <button
          type="button"
          onClick={next}
          aria-label="Volgende maand"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-body hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAGEN_KORT.map((d) => (
          <div key={d} className="pb-1 text-center font-mono text-2xs uppercase tracking-label text-text-muted">
            {d}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = toIso(new Date(year, month0, day));
          const status = statuses[iso] ?? "closed";
          const selectable = status === "available" || status === "limited";
          const isSelected = selectedDate === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={!selectable}
              aria-pressed={isSelected}
              aria-label={`${day} ${MAANDEN[month0]}${status === "full" ? " — vol" : status === "closed" ? " — gesloten" : ""}`}
              onClick={() => selectable && onSelect(iso)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol",
                statusStyle[status],
                isSelected && "!bg-petrol !text-white !ring-0",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="mt-3 flex items-center gap-2 font-mono text-2xs text-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Beschikbaarheid laden…
        </p>
      )}

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-2xs text-text-muted">
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-status-available/40 ring-1 ring-status-available/40" aria-hidden /> Beschikbaar</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-status-reserved/40 ring-1 ring-status-reserved/40" aria-hidden /> Bijna vol</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-surface-muted ring-1 ring-line" aria-hidden /> Vol</li>
        <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm ring-1 ring-line" aria-hidden /> Gesloten</li>
      </ul>
    </div>
  );
}
