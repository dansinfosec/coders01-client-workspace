import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Wrench,
  Cog,
  CalendarCheck,
  ThermometerSnowflake,
  ScanLine,
  Zap,
  CircleGauge,
  Disc3,
  Settings2,
  Snowflake,
  Sun,
  Wind,
  MoreHorizontal,
} from "lucide-react";

export interface Werkzaamheid {
  id: string;
  label: string;
  description?: string;
  /** Confirmed BM "vanaf" price, or "Gratis". Undefined = price on request (TODO confirm). */
  price?: string;
  /** Optional promotion / action line. */
  action?: string;
  /** Indicative duration in minutes (operational estimate — TODO confirm with client). */
  durationMin: number;
  icon: LucideIcon;
}

// Prices/actions use only confirmed BM facts (APK €44,95; kleine beurt €110; grote beurt €169;
// gratis APK bij grote beurt). Durations are indicative estimates. Other prices: TODO confirm.
export const werkzaamheden: Werkzaamheid[] = [
  {
    id: "apk-keuring",
    label: "APK-keuring",
    description: "Wettelijke keuring, RDW-erkend. Klaar terwijl u wacht.",
    price: "€44,95",
    action: "Gratis bij een grote beurt",
    durationMin: 45,
    icon: ShieldCheck,
  },
  {
    id: "kleine-beurt",
    label: "Kleine onderhoudsbeurt",
    description: "Ca. 25 controlepunten, olie en oliefilter verversen.",
    price: "vanaf €110",
    durationMin: 60,
    icon: Wrench,
  },
  {
    id: "grote-beurt",
    label: "Grote onderhoudsbeurt",
    description: "Uitgebreide controle, filters, bougies, motormanagement uitlezen.",
    price: "vanaf €169",
    action: "Gratis APK inbegrepen",
    durationMin: 120,
    icon: Cog,
  },
  {
    id: "jaarlijkse-beurt",
    label: "Jaarlijkse onderhoudsbeurt",
    description: "Onderhoud volgens fabrieksinterval, met behoud van garantie.",
    durationMin: 90,
    icon: CalendarCheck,
  },
  {
    id: "airco-onderhoud",
    label: "Airco-onderhoud",
    description: "Airco checken, reinigen en bijvullen voor optimale koeling.",
    durationMin: 60,
    icon: ThermometerSnowflake,
  },
  {
    id: "diagnose",
    label: "Diagnose",
    description: "Foutcodes uitlezen met AUTEL en de oorzaak opsporen.",
    durationMin: 45,
    icon: ScanLine,
  },
  {
    id: "ev-servicebeurt",
    label: "Servicebeurt elektrische auto",
    description: "Onderhoud afgestemd op elektrische auto's.",
    durationMin: 90,
    icon: Zap,
  },
  {
    id: "bandenwissel-set",
    label: "Bandenwissel — complete set",
    description: "Vier gemonteerde wielen wisselen en op spanning brengen.",
    durationMin: 45,
    icon: CircleGauge,
  },
  {
    id: "bandenwissel-los",
    label: "Bandenwissel — losse banden",
    description: "Losse banden op velg monteren en balanceren.",
    durationMin: 30,
    icon: Disc3,
  },
  {
    id: "reparatie",
    label: "Reparatie",
    description: "Herstel van een concrete klacht. Kosten vooraf in overleg.",
    durationMin: 90,
    icon: Settings2,
  },
  {
    id: "wintercheck",
    label: "Gratis wintercheck",
    description: "Accu, ruitenwissers, verlichting en vloeistoffen gecontroleerd.",
    price: "Gratis",
    durationMin: 20,
    icon: Snowflake,
  },
  {
    id: "zomercheck",
    label: "Gratis zomercheck",
    description: "Klaar voor de vakantie: banden, koeling en airco gecontroleerd.",
    price: "Gratis",
    durationMin: 20,
    icon: Sun,
  },
  {
    id: "aircocheck",
    label: "Gratis aircocheck",
    description: "Snelle controle van de werking van uw airco.",
    price: "Gratis",
    durationMin: 20,
    icon: Wind,
  },
  {
    id: "anders",
    label: "Anders",
    description: "Iets anders? Beschrijf het hieronder in het toelichtingsveld.",
    durationMin: 30,
    icon: MoreHorizontal,
  },
];

const byId = new Map(werkzaamheden.map((w) => [w.id, w]));

export const werkzaamheidLabel = (id: string): string => byId.get(id)?.label ?? id;

/** Sum of indicative durations for the selected jobs (minutes). */
export const totalDuration = (ids: string[]): number =>
  ids.reduce((sum, id) => sum + (byId.get(id)?.durationMin ?? 0), 0);
