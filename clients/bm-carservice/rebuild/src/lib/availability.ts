/**
 * Appointment availability — MOCK service, now PER LOCATION.
 *
 * ⚠️  Demo data, NOT live workshop availability. The UI labels it as such. Each branch has its
 * own opening hours, closed days, offered services and (mock) capacity, so it is technically
 * clear that every location has its own agenda. All mock logic lives here.
 *
 * Backend integration point
 * --------------------------
 * Replace the three exported functions with real, per-location calls, keeping the SAME signatures.
 *   getAvailableDates(locationId, year, month, services)
 *   getAvailableTimeSlots(locationId, date, services)
 *   createAppointment({ locationId, vehicle, mileage, services, date, time, customer })
 * Targets: eigen Django/DRF-backend, Google/Outlook Calendar (per calendarId, via serverproxy),
 * of bestaande garageplanningssoftware. Do not connect an external service without consent.
 */
import { getLocation, defaultLocation, type Location } from "@/data/locations";
import { totalDuration } from "@/data/werkzaamheden";

export const AVAILABILITY_IS_MOCK = true;

export type DayStatus = "available" | "limited" | "full" | "closed" | "past";

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AppointmentPayload {
  locationId: string;
  vehicle: { kenteken: string; merk: string; handelsbenaming: string; brandstof?: string; vervaldatumApk?: string } | null;
  mileage: string;
  services: string[];
  toelichting?: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:MM
  customer: { naam: string; telefoon: string; email?: string; vervangendVervoer: "ja" | "nee"; bericht?: string };
}

export const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];
export const WEEKDAGEN_KORT = ["Maa", "Din", "Woe", "Don", "Vrij", "Zat", "Zon"];
export const WEEKDAGEN_LANG = [
  "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag",
];

const SLOT_STEP = 30;
const MIN_DURATION = 30;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pad = (n: number) => String(n).padStart(2, "0");
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

const resolve = (locationId: string): Location => getLocation(locationId) ?? defaultLocation;

function rangesFor(location: Location, jsDay: number): Array<[number, number]> {
  return location.openingHours.find((d) => d.weekday === jsDay)?.ranges ?? [];
}

/** Deterministic status for a single date at a branch given the selected services. */
export function dayStatus(locationId: string, iso: string, selectedServices: string[]): DayStatus {
  const location = resolve(locationId);
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  if (date < startOfToday()) return "past";
  if (rangesFor(location, date.getDay()).length === 0) return "closed";

  const duration = Math.max(totalDuration(selectedServices), MIN_DURATION);
  const bias = (duration >= 120 ? 2 : duration >= 90 ? 1 : 0) + (hash(location.id) % 2); // per-branch capacity
  const roll = (hash(location.id + iso) % 10) - bias;
  if (roll <= 0) return "full";
  if (roll <= 2) return "limited";
  return "available";
}

export async function getAvailableDates(
  locationId: string,
  year: number,
  month0: number,
  selectedServices: string[],
): Promise<Record<string, DayStatus>> {
  await delay(200);
  const result: Record<string, DayStatus> = {};
  const days = new Date(year, month0 + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const iso = `${year}-${pad(month0 + 1)}-${pad(d)}`;
    result[iso] = dayStatus(locationId, iso, selectedServices);
  }
  return result;
}

export function monthHasBookableDays(
  locationId: string,
  year: number,
  month0: number,
  selectedServices: string[],
): boolean {
  const days = new Date(year, month0 + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const s = dayStatus(locationId, `${year}-${pad(month0 + 1)}-${pad(d)}`, selectedServices);
    if (s === "available" || s === "limited") return true;
  }
  return false;
}

export async function getAvailableTimeSlots(
  locationId: string,
  iso: string,
  selectedServices: string[],
): Promise<TimeSlot[]> {
  await delay(350);
  const location = resolve(locationId);
  const status = dayStatus(locationId, iso, selectedServices);
  if (status === "past" || status === "closed" || status === "full") return [];

  const [y, m, d] = iso.split("-").map(Number);
  const jsDay = new Date(y!, m! - 1, d!).getDay();
  const duration = Math.max(totalDuration(selectedServices), MIN_DURATION);
  const limited = status === "limited";

  const slots: TimeSlot[] = [];
  for (const [open, close] of rangesFor(location, jsDay)) {
    for (let t = open; t + duration <= close; t += SLOT_STEP) {
      const time = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
      const roll = hash(location.id + iso + time) % (limited ? 2 : 4);
      slots.push({ time, available: roll !== 0 });
    }
  }
  return slots;
}

export async function createAppointment(payload: AppointmentPayload): Promise<{ id: string; mock: true }> {
  await delay(300);
  const ref = `BM-${payload.locationId.slice(0, 3).toUpperCase()}-${hash(payload.locationId + payload.date + payload.time) % 100000}`;
  // eslint-disable-next-line no-console
  console.info("[MOCK] createAppointment", ref, payload);
  return { id: ref, mock: true };
}

/** Format an ISO date + time as e.g. "Woensdag 5 augustus 2026 om 08:00". */
export function formatChosen(iso: string, time: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  const dag = WEEKDAGEN_LANG[mondayIndex(date.getDay())]!;
  const cap = dag.charAt(0).toUpperCase() + dag.slice(1);
  return `${cap} ${d} ${MAANDEN[m! - 1]} ${y} om ${time}`;
}
