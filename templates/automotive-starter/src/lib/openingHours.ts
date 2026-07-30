import type { OpeningDay } from "@/data/company";

const fmt = (minutes: number) => {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/** "08:30–18:00" of "Gesloten". */
export function formatRanges(day: OpeningDay): string {
  if (day.ranges.length === 0) return "Gesloten";
  return day.ranges.map(([o, c]) => `${fmt(o)}–${fmt(c)}`).join(", ");
}

export interface OpenState {
  open: boolean;
  /** Vandaag-label ("Maandag"). */
  today: OpeningDay | undefined;
  /** Openingstijd van vandaag als string, of undefined. */
  todayRanges: string;
  /** Bericht: "Nu geopend tot 18:00" / "Gesloten — morgen open om 08:30". */
  message: string;
}

/** Bepaalt of de garage nu open is (op basis van de lokale tijd van de bezoeker). */
export function getOpenState(hours: OpeningDay[], now: Date = new Date()): OpenState {
  const weekday = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = hours.find((d) => d.weekday === weekday);
  const todayRanges = today ? formatRanges(today) : "Gesloten";

  const openRange = today?.ranges.find(([o, c]) => minutes >= o && minutes < c);
  if (openRange) {
    return { open: true, today, todayRanges, message: `Nu geopend — tot ${fmt(openRange[1])}` };
  }

  // Volgende opening zoeken (vandaag later, of komende dagen).
  const laterToday = today?.ranges.find(([o]) => minutes < o);
  if (laterToday) {
    return { open: false, today, todayRanges, message: `Gesloten — vandaag open om ${fmt(laterToday[0])}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = hours.find((h) => h.weekday === (weekday + i) % 7);
    if (d && d.ranges.length > 0) {
      const when = i === 1 ? "morgen" : d.day.toLowerCase();
      return { open: false, today, todayRanges, message: `Gesloten — ${when} open om ${fmt(d.ranges[0]![0])}` };
    }
  }
  return { open: false, today, todayRanges, message: "Gesloten" };
}
