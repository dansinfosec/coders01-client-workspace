import { useEffect, useState } from "react";
import { business } from "@/data/business";

export interface OpenStatus {
  todayIndex: number;
  isOpen: boolean;
  /** Minutes-from-midnight close time for today, if open now. */
  closesAt: string | null;
  /** Next opening label if currently closed. */
  opensLabel: string | null;
}

const fmt = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

/**
 * Compute today's open/closed status from business.hours.
 * Uses the visitor's local clock (assumed NL / Europe-Amsterdam for this shop).
 */
export function useOpenStatus(): OpenStatus {
  const compute = (): OpenStatus => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const mins = now.getHours() * 60 + now.getMinutes();
    const today = business.hours.find((h) => h.dayIndex === day);
    if (today?.range) {
      const [open, close] = today.range;
      if (mins >= open && mins < close) {
        return { todayIndex: day, isOpen: true, closesAt: fmt(close), opensLabel: null };
      }
      if (mins < open) {
        return { todayIndex: day, isOpen: false, closesAt: null, opensLabel: `Opent vandaag om ${fmt(open)}` };
      }
    }
    // Closed now — find the next day that has hours.
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      const next = business.hours.find((h) => h.dayIndex === d);
      if (next?.range) {
        const label = i === 1 ? "morgen" : next.label.toLowerCase();
        return { todayIndex: day, isOpen: false, closesAt: null, opensLabel: `Opent ${label} om ${fmt(next.range[0])}` };
      }
    }
    return { todayIndex: day, isOpen: false, closesAt: null, opensLabel: null };
  };

  const [status, setStatus] = useState<OpenStatus>(compute);

  useEffect(() => {
    const id = window.setInterval(() => setStatus(compute()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return status;
}
