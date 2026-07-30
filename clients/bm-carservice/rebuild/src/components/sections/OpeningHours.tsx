import { company } from "@/data/company";
import { formatRanges } from "@/lib/openingHours";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/utils/cn";

/** Opening-hours board (mono) with live status. Used on home + contact. */
export function OpeningHours({ className }: { className?: string }) {
  const todayWeekday = new Date().getDay();
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-6 shadow-soft", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Openingstijden
        </h3>
        <StatusPill />
      </div>
      <dl className="mt-4 divide-y divide-line font-mono text-sm">
        {company.openingHours.map((day) => {
          const isToday = day.weekday === todayWeekday;
          const closed = day.ranges.length === 0;
          return (
            <div
              key={day.day}
              className={cn("flex items-baseline justify-between gap-4 py-2", isToday && "font-semibold")}
            >
              <dt className={cn(isToday ? "text-text-strong" : "text-text-body")}>
                {day.day}
                {isToday && <span className="ml-2 text-[0.65rem] uppercase text-mark-strong">vandaag</span>}
              </dt>
              <dd className={closed ? "text-text-muted" : "text-text-strong"}>{formatRanges(day)}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
