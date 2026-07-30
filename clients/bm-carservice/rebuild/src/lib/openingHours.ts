import { company, type OpeningDay } from "@/data/company";

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
  /** Short human label, e.g. "Nu geopend · tot 17:30" or "Gesloten · opent ma 08:30". */
  label: string;
}

const byWeekday = (weekday: number): OpeningDay =>
  company.openingHours.find((d) => d.weekday === weekday) ??
  company.openingHours[0]!;

/**
 * Live open/closed status for a given moment (defaults to now).
 * Pure function of the passed date so it is easy to test.
 */
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const weekday = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = byWeekday(weekday);

  for (const [open, close] of today.ranges) {
    if (minutes >= open && minutes < close) {
      return { isOpen: true, label: `Nu geopend · tot ${fmt(close)}` };
    }
    if (minutes < open) {
      return { isOpen: false, label: `Gesloten · opent vandaag ${fmt(open)}` };
    }
  }

  // Closed for the rest of today — find the next day with hours.
  for (let i = 1; i <= 7; i++) {
    const next = byWeekday((weekday + i) % 7);
    if (next.ranges.length > 0) {
      const firstOpen = next.ranges[0]![0];
      const dayLabel = i === 1 ? "morgen" : next.day.slice(0, 2).toLowerCase();
      return { isOpen: false, label: `Gesloten · opent ${dayLabel} ${fmt(firstOpen)}` };
    }
  }

  return { isOpen: false, label: "Gesloten" };
}
