import { createContext, useContext } from "react";
import type { RdwVehicle } from "@/lib/rdw";

export interface AfspraakData {
  // Step 0 — location
  locationId: string;
  // Step 1 — vehicle
  kenteken: string;
  kilometerstand: string;
  vehicle: RdwVehicle | null;
  // Step 2 — jobs & planning
  werkzaamheden: string[];
  toelichting: string; // free text when "Anders" is selected
  datum: string; // ISO YYYY-MM-DD
  tijd: string; // HH:MM
  // Step 3 — contact
  naam: string;
  telefoon: string;
  email: string;
  vervangendVervoer: "ja" | "nee";
  bericht: string;
}

export interface AfspraakContextValue {
  data: AfspraakData;
  update: (patch: Partial<AfspraakData>) => void;
  toggleWerkzaamheid: (id: string) => void;
  reset: () => void;
}

export const EMPTY: AfspraakData = {
  locationId: "",
  kenteken: "",
  kilometerstand: "",
  vehicle: null,
  werkzaamheden: [],
  toelichting: "",
  datum: "",
  tijd: "",
  naam: "",
  telefoon: "",
  email: "",
  vervangendVervoer: "nee",
  bericht: "",
};

export const STORAGE_KEY = "bm-afspraak";

export function loadAfspraak(): AfspraakData {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<AfspraakData>) };
  } catch {
    // ignore malformed storage
  }
  return EMPTY;
}

export const AfspraakCtx = createContext<AfspraakContextValue | null>(null);

export function useAfspraak(): AfspraakContextValue {
  const ctx = useContext(AfspraakCtx);
  if (!ctx) throw new Error("useAfspraak must be used within AfspraakProvider");
  return ctx;
}
