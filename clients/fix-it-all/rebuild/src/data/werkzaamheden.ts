import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Gauge,
  Cog,
  Wrench,
  Snowflake,
  CircleDot,
  Flame,
  Hammer,
  ScanLine,
  MoreHorizontal,
} from "lucide-react";

/**
 * Centrale, configureerbare lijst van boekbare werkzaamheden voor de afspraakmodule.
 * De afspraakflow en de kalender (slotduur) putten hieruit.
 *
 * REGEL: geen prijzen. `durationMin` is een INDICATIEVE operationele schatting voor de planning
 * (geen toezegging), TODO: bevestigen met klant. De enige actie is "gratis APK bij een grote beurt".
 */
export interface Werkzaamheid {
  id: string;
  label: string;
  description?: string;
  /** Indicatieve duur in minuten (planning-schatting). */
  durationMin: number;
  /** Optionele actieregel. */
  action?: string;
  icon: LucideIcon;
}

export const werkzaamheden: Werkzaamheid[] = [
  { id: "apk-keuring", label: "APK-keuring", description: "RDW-erkende keuring.", durationMin: 45, action: "Gratis bij een grote beurt", icon: ShieldCheck },
  { id: "kleine-beurt", label: "Kleine onderhoudsbeurt", description: "Olie + oliefilter en 20+ controlepunten.", durationMin: 60, icon: Gauge },
  { id: "grote-beurt", label: "Grote onderhoudsbeurt", description: "Bougies, filters en 80+ controlepunten.", durationMin: 120, action: "Gratis APK inbegrepen", icon: Cog },
  { id: "onderhoud", label: "Algemeen onderhoud", description: "Onderhoud op maat voor uw auto.", durationMin: 90, icon: Wrench },
  { id: "airco-service", label: "Aircoservice", description: "Airco reinigen, controleren en bijvullen.", durationMin: 60, icon: Snowflake },
  { id: "bandenservice", label: "Bandenservice", description: "Monteren, balanceren of reparatie.", durationMin: 45, icon: CircleDot },
  { id: "uitlaat-laswerk", label: "Uitlaat & laswerk", description: "Uitlaat lassen bij lekkage of roest.", durationMin: 60, icon: Flame },
  { id: "reparatie", label: "Reparatie", description: "Herstel van een concrete klacht (in overleg).", durationMin: 90, icon: Hammer },
  { id: "diagnose", label: "Diagnose", description: "Storing of waarschuwingslampje uitlezen.", durationMin: 45, icon: ScanLine },
  { id: "anders", label: "Anders / weet ik niet zeker", description: "Licht het hieronder toe.", durationMin: 45, icon: MoreHorizontal },
];

const byId = new Map(werkzaamheden.map((w) => [w.id, w]));

export const getWerkzaamheid = (id: string): Werkzaamheid | undefined => byId.get(id);
export const werkzaamheidLabel = (id: string): string => byId.get(id)?.label ?? id;

/** Som van indicatieve duren (minuten) voor de geselecteerde werkzaamheden. */
export const totalDuration = (ids: string[]): number =>
  ids.reduce((sum, id) => sum + (byId.get(id)?.durationMin ?? 0), 0);
