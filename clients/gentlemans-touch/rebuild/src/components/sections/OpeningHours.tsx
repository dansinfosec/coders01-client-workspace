import { Clock } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/utils/cn";
import { business } from "@/data/business";
import { useOpenStatus } from "@/hooks/useOpenStatus";

const hm = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

// Display order Monday → Sunday.
const order = [1, 2, 3, 4, 5, 6, 0];

export function OpeningHours() {
  const status = useOpenStatus();

  return (
    <Section id="openingstijden" tone="muted" ariaLabel="Openingstijden">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionHeading eyebrow="Openingstijden" title="Wanneer u terecht kunt" />
          <div
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
              status.isOpen ? "border-cream/40 bg-cream/10 text-cream" : "border-red/50 bg-red/10 text-text-strong",
            )}
          >
            <span
              className={cn("h-2.5 w-2.5 rounded-full", status.isOpen ? "bg-cream" : "bg-red")}
              aria-hidden="true"
            />
            {status.isOpen ? `Nu open · sluit om ${status.closesAt}` : "Nu gesloten"}
            {!status.isOpen && status.opensLabel ? ` · ${status.opensLabel}` : ""}
          </div>
        </div>

        <dl className="divide-y divide-line rounded-2xl border border-line bg-ink">
          {order.map((di) => {
            const day = business.hours.find((h) => h.dayIndex === di)!;
            const isToday = di === status.todayIndex;
            return (
              <div
                key={di}
                className={cn(
                  "flex items-center justify-between px-5 py-3",
                  isToday && "bg-cream/5",
                )}
              >
                <dt
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    isToday ? "text-cream" : "text-text-body",
                  )}
                >
                  {isToday && <Clock className="h-4 w-4" aria-hidden="true" />}
                  {day.label}
                  {isToday && <span className="text-xs text-text-muted">(vandaag)</span>}
                </dt>
                <dd
                  className={cn(
                    "text-sm tabular-nums",
                    day.range ? (isToday ? "font-semibold text-cream" : "text-text-strong") : "text-text-muted",
                  )}
                >
                  {day.range ? `${hm(day.range[0])} – ${hm(day.range[1])}` : "Gesloten"}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      <p className="mt-4 text-xs text-text-muted">Openingstijden via Google Maps.</p>
    </Section>
  );
}
