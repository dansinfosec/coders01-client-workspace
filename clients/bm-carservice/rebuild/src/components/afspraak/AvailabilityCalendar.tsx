import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import {
  getAvailableDates,
  monthHasBookableDays,
  mondayIndex,
  toIso,
  MAANDEN,
  WEEKDAGEN_KORT,
  type DayStatus,
} from "@/lib/availability";
import { cn } from "@/utils/cn";

interface Props {
  locationId: string;
  selectedServices: string[];
  selectedDate: string;
  onSelectDate: (iso: string) => void;
}

const STATUS_LABEL: Record<DayStatus, string> = {
  available: "beschikbaar",
  limited: "bijna vol",
  full: "vol",
  closed: "niet beschikbaar",
  past: "niet meer beschikbaar",
};

const cellTone: Record<DayStatus, string> = {
  available: "bg-pass text-white hover:brightness-110",
  limited: "bg-signal text-ink hover:brightness-105",
  full: "bg-mark/90 text-white line-through cursor-not-allowed",
  closed: "bg-surface-muted text-text-muted/60 cursor-not-allowed",
  past: "bg-surface-muted text-text-muted/50 cursor-not-allowed",
};

const legend: Array<{ status: DayStatus; label: string; swatch: string }> = [
  { status: "available", label: "Beschikbaar", swatch: "bg-pass" },
  { status: "limited", label: "Bijna vol", swatch: "bg-signal" },
  { status: "full", label: "Vol", swatch: "bg-mark/90" },
  { status: "closed", label: "Niet beschikbaar", swatch: "bg-surface-muted ring-1 ring-line" },
];

export function AvailabilityCalendar({ locationId, selectedServices, selectedDate, onSelectDate }: Props) {
  const now = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [statuses, setStatuses] = useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const servicesKey = selectedServices.join(",");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getAvailableDates(locationId, view.y, view.m, servicesKey ? servicesKey.split(",") : [])
      .then((res) => active && setStatuses(res))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locationId, view.y, view.m, servicesKey]);

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const lead = mondayIndex(new Date(view.y, view.m, 1).getDay());
  const cells: Array<number | null> = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = view.m === 0 ? { y: view.y - 1, m: 11 } : { y: view.y, m: view.m - 1 };
  const nextMonth = view.m === 11 ? { y: view.y + 1, m: 0 } : { y: view.y, m: view.m + 1 };
  const prevDisabled = !monthHasBookableDays(locationId, prevMonth.y, prevMonth.m, selectedServices);
  // Cap forward navigation at ~12 months out.
  const monthsAhead = (nextMonth.y - now.getFullYear()) * 12 + (nextMonth.m - now.getMonth());
  const nextDisabled = monthsAhead > 12;

  const todayIso = toIso(now);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => !prevDisabled && setView(prevMonth)}
          disabled={prevDisabled}
          aria-label="Vorige maand"
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-text-strong hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-display text-lg font-bold text-text-strong" aria-live="polite">
          {MAANDEN[view.m]!.charAt(0).toUpperCase() + MAANDEN[view.m]!.slice(1)} {view.y}
        </h3>
        <button
          type="button"
          onClick={() => !nextDisabled && setView(nextMonth)}
          disabled={nextDisabled}
          aria-label="Volgende maand"
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-text-strong hover:bg-surface-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center font-mono text-xs uppercase tracking-wide text-text-muted">
        {WEEKDAGEN_KORT.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative mt-1.5 grid grid-cols-7 gap-1.5" role="grid" aria-label="Beschikbaarheidskalender">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-lg bg-surface/70 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        )}
        {error && !loading && (
          <div className="col-span-7 flex items-center gap-2 rounded-lg bg-error/10 p-4 text-sm text-error">
            <AlertCircle className="h-4 w-4" /> Beschikbaarheid kon niet worden geladen. Probeer het later opnieuw.
          </div>
        )}
        {!error &&
          cells.map((day, i) => {
            if (day === null) return <div key={i} aria-hidden="true" />;
            const iso = `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const status = statuses[iso] ?? "closed";
            const clickable = status === "available" || status === "limited";
            const isSelected = selectedDate === iso;
            const isToday = iso === todayIso;
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                disabled={!clickable}
                aria-pressed={isSelected}
                aria-label={`${day} ${MAANDEN[view.m]}, ${STATUS_LABEL[status]}${isToday ? ", vandaag" : ""}`}
                onClick={() => clickable && onSelectDate(iso)}
                className={cn(
                  "relative aspect-square rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1",
                  cellTone[status],
                  isSelected && "ring-2 ring-ink ring-offset-2",
                )}
              >
                {day}
                {isToday && !isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 mx-auto h-1 w-1 rounded-full bg-current opacity-80"
                  />
                )}
              </button>
            );
          })}
      </div>

      {/* Legend */}
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-body">
        {legend.map((l) => (
          <li key={l.status} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("h-3 w-3 rounded-sm", l.swatch)} />
            {l.label}
          </li>
        ))}
      </ul>

      <p className="mt-3 font-mono text-xs text-text-muted">
        Beschikbaarheid is een demo — nog niet gekoppeld aan de werkplaatsagenda.
      </p>
    </div>
  );
}
