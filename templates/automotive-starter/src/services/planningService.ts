/**
 * Afspraakbeschikbaarheid — MOCK-service (vervangbaar).
 *
 * ⚠️  Demo-data, GEEN live werkplaatsagenda. De UI labelt dit expliciet. Alle mock-logica staat hier.
 *
 * Backend-integratiepunt
 * ----------------------
 * Vervang de drie exports door échte calls met DEZELFDE signatures:
 *   getAvailableDates(year, month0, services)
 *   getAvailableTimeSlots(date, services)
 *   createAppointment({ vehicle, mileage, services, date, time, customer })
 * Doelen: eigen Django/DRF-backend, Google/Outlook Calendar (via serverproxy) of bestaande
 * garageplanningssoftware. Koppel geen externe dienst zonder toestemming.
 */
import { company } from "@/data/company";
import { totalDuration } from "@/data/werkzaamheden";
import type { Vehicle } from "@/lib/rdw";

export const AVAILABILITY_IS_MOCK = true;

export type DayStatus = "available" | "limited" | "full" | "closed" | "past";

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AppointmentCustomer {
  naam: string;
  telefoon: string;
  email?: string;
  vervangendVervoer: "geen" | "leenfiets" | "leenscooter";
  bericht?: string;
}

export interface AppointmentPayload {
  vehicle: Pick<Vehicle, "kenteken" | "merk" | "handelsbenaming" | "brandstof" | "vervaldatumApk"> | null;
  mileage: string;
  services: string[];
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:MM
  customer: AppointmentCustomer;
}

export const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];
export const WEEKDAGEN_KORT = ["ma", "di", "wo", "do", "vr", "za", "zo"];
export const WEEKDAGEN_LANG = [
  "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag",
];

const SLOT_STEP = 30;
const MIN_DURATION = 30;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pad = (n: number) => String(n).padStart(2, "0");

export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** JS getDay() (0=zo) → maandag-index (0=ma … 6=zo). */
export const mondayIndex = (jsDay: number) => (jsDay + 6) % 7;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function rangesFor(jsDay: number): Array<[number, number]> {
  return company.openingHours.find((d) => d.weekday === jsDay)?.ranges ?? [];
}

/** Deterministische status voor één datum, gegeven de gekozen werkzaamheden. */
export function dayStatus(iso: string, selectedServices: string[]): DayStatus {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  if (date < startOfToday()) return "past";
  if (rangesFor(date.getDay()).length === 0) return "closed";

  const duration = Math.max(totalDuration(selectedServices), MIN_DURATION);
  const bias = duration >= 120 ? 2 : duration >= 90 ? 1 : 0;
  const roll = (hash(iso) % 10) - bias;
  if (roll <= 0) return "full";
  if (roll <= 2) return "limited";
  return "available";
}

export async function getAvailableDates(
  year: number,
  month0: number,
  selectedServices: string[],
): Promise<Record<string, DayStatus>> {
  await delay(180);
  const result: Record<string, DayStatus> = {};
  const days = new Date(year, month0 + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const iso = `${year}-${pad(month0 + 1)}-${pad(d)}`;
    result[iso] = dayStatus(iso, selectedServices);
  }
  return result;
}

export function monthHasBookableDays(year: number, month0: number, selectedServices: string[]): boolean {
  const days = new Date(year, month0 + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const s = dayStatus(`${year}-${pad(month0 + 1)}-${pad(d)}`, selectedServices);
    if (s === "available" || s === "limited") return true;
  }
  return false;
}

export async function getAvailableTimeSlots(iso: string, selectedServices: string[]): Promise<TimeSlot[]> {
  await delay(280);
  const status = dayStatus(iso, selectedServices);
  if (status === "past" || status === "closed" || status === "full") return [];

  const [y, m, d] = iso.split("-").map(Number);
  const jsDay = new Date(y!, m! - 1, d!).getDay();
  const duration = Math.max(totalDuration(selectedServices), MIN_DURATION);
  const limited = status === "limited";

  const slots: TimeSlot[] = [];
  for (const [open, close] of rangesFor(jsDay)) {
    for (let t = open; t + duration <= close; t += SLOT_STEP) {
      const time = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
      const roll = hash(iso + time) % (limited ? 2 : 4);
      slots.push({ time, available: roll !== 0 });
    }
  }
  return slots;
}

export async function createAppointment(payload: AppointmentPayload): Promise<{ id: string; mock: true }> {
  await delay(300);
  const ref = `FIA-${hash(payload.date + payload.time + (payload.vehicle?.kenteken ?? "")) % 100000}`;
  console.info("[MOCK] createAppointment", ref, payload);
  return { id: ref, mock: true };
}

/** Format een ISO-datum + tijd als "Woensdag 5 augustus 2026 om 08:00". */
export function formatChosen(iso: string, time: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  const dag = WEEKDAGEN_LANG[mondayIndex(date.getDay())]!;
  const cap = dag.charAt(0).toUpperCase() + dag.slice(1);
  return `${cap} ${d} ${MAANDEN[m! - 1]} ${y} om ${time}`;
}
