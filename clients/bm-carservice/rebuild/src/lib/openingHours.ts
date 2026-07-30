import { company, type OpeningDay } from "@/data/company";

export type OpeningHours = OpeningDay[];

const fmt = (mins: number): string => {
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/** Format a day's ranges as "08:30–13:00, 13:45–17:30" or "Gesloten". */
export function formatRanges(day: OpeningDay): string {
  if (day.ranges.length === 0) return "Gesloten";
  return day.ranges.map(([a, b]) => `${fmt(a)}–${fmt(b)}`).join(", ");
}

export interface OpenStatus {
  isOpen: boolean;
  label: string;
}

const byWeekday = (hours: OpeningHours, weekday: number): OpeningDay =>
  hours.find((d) => d.weekday === weekday) ?? hours[0]!;

/**
 * Live open/closed status for a given set of opening hours (defaults to the HQ / company hours).
 * Pure function of the passed date so it is easy to test and works per location.
 */
export function getOpenStatus(
  hours: OpeningHours = company.openingHours,
  now: Date = new Date(),
): OpenStatus {
  const weekday = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = byWeekday(hours, weekday);

  for (const [open, close] of today.ranges) {
    if (minutes >= open && minutes < close) {
      return { isOpen: true, label: `Nu geopend · tot ${fmt(close)}` };
    }
    if (minutes < open) {
      return { isOpen: false, label: `Gesloten · opent vandaag ${fmt(open)}` };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = byWeekday(hours, (weekday + i) % 7);
    if (next.ranges.length > 0) {
      const firstOpen = next.ranges[0]![0];
      const dayLabel = i === 1 ? "morgen" : next.day.slice(0, 2).toLowerCase();
      return { isOpen: false, label: `Gesloten · opent ${dayLabel} ${fmt(firstOpen)}` };
    }
  }

  return { isOpen: false, label: "Gesloten" };
}

/** Compact week span, e.g. "Ma–vr · 08:30–17:30". Falls back gracefully for varied hours. */
export function weekSummary(hours: OpeningHours): string {
  const open = hours.filter((d) => d.ranges.length > 0 && d.weekday >= 1 && d.weekday <= 5);
  if (open.length === 0) return "Openingstijden op aanvraag";
  const firstOpen = Math.min(...open.flatMap((d) => d.ranges.map((r) => r[0])));
  const lastClose = Math.max(...open.flatMap((d) => d.ranges.map((r) => r[1])));
  const hasSat = hours.find((d) => d.weekday === 6 && d.ranges.length > 0);
  return `Ma–vr ${fmt(firstOpen)}–${fmt(lastClose)}${hasSat ? " · za open" : ""}`;
}
