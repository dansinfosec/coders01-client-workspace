/** Occasionstatussen (uit de opdracht) — losse module zodat componentbestanden alleen componenten exporteren. */
export type OccasionStatus =
  | "nieuw-binnen"
  | "beschikbaar"
  | "gereserveerd"
  | "verkocht"
  | "binnenkort";

export const occasionStatusLabels: Record<OccasionStatus, string> = {
  "nieuw-binnen": "Nieuw binnen",
  beschikbaar: "Beschikbaar",
  gereserveerd: "Gereserveerd",
  verkocht: "Verkocht",
  binnenkort: "Binnenkort verwacht",
};

export const occasionStatusLabel = (status: OccasionStatus): string => occasionStatusLabels[status];

/** Tokenklassen per status (dot / tekst / ring). Verwijst naar de tailwind status-kleuren. */
export const occasionStatusStyle: Record<OccasionStatus, { dot: string; text: string; ring: string }> = {
  "nieuw-binnen": { dot: "bg-status-new", text: "text-status-new", ring: "ring-status-new/30" },
  beschikbaar: { dot: "bg-status-available", text: "text-status-available", ring: "ring-status-available/30" },
  gereserveerd: { dot: "bg-status-reserved", text: "text-status-reserved", ring: "ring-status-reserved/30" },
  verkocht: { dot: "bg-status-sold", text: "text-status-sold", ring: "ring-status-sold/30" },
  binnenkort: { dot: "bg-status-soon", text: "text-status-soon", ring: "ring-status-soon/30" },
};
