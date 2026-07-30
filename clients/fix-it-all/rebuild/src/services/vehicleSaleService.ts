/**
 * Auto-verkopen — MOCK-service (vervangbaar). ⚠️ Er wordt NIETS echt opgeslagen of verzonden.
 * De UI labelt dit expliciet en belooft nooit een (gegarandeerd) bod.
 *
 * Backend-integratiepunt — vervang de exports door échte calls met DEZELFDE signatures:
 *   submitVehicleSaleLead(payload)        → POST /api/vehicle-sale-leads/
 *   uploadVehicleSalePhotos(files, onP)   → POST /api/vehicle-sale-leads/:ref/photos/
 *   getVehicleSaleLead(referenceNumber)   → GET  /api/vehicle-sale-leads/:ref/
 * Zie docs/VEHICLE_SALE_BACKEND.md.
 */
import type { ProcessedImage } from "@/lib/image";

export const VEHICLE_SALE_IS_MOCK = true;

export interface VehicleSaleVehicle {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  brandstof: string;
  voertuigsoort: string;
  datumEersteToelating: string;
  vervaldatumApk: string;
  /** Handmatig ingevuld wanneer het kenteken onbekend is. */
  manual?: { merk: string; model: string; uitvoering: string; bouwjaar: string };
}

export interface VehicleSaleContact {
  naam: string;
  telefoon: string;
  email?: string;
  postcode?: string;
  woonplaats?: string;
  klanttype: "particulier" | "zakelijk";
  belvoorkeur: "ochtend" | "middag" | "avond" | "geen";
  whatsapp: boolean;
  privacyAkkoord: boolean;
}

export interface VehicleSalePayload {
  vehicle: VehicleSaleVehicle | null;
  mileage: string;
  condition: Record<string, string>;
  damageDescription: string;
  expectedPrice: string;
  laatsteOnderhoud: string;
  toelichting: string;
  photoCount: number;
  photosComplete: boolean;
  contact: VehicleSaleContact;
}

export interface VehicleSaleResult {
  referenceNumber: string;
  photosComplete: boolean;
  mock: true;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Genereer een referentienummer (deterministisch op de inhoud). */
function makeRef(payload: VehicleSalePayload): string {
  const seed = `${payload.vehicle?.kenteken ?? "manual"}-${payload.contact.telefoon}-${payload.contact.naam}`;
  return `FIA-V${(hash(seed) % 900000 + 100000).toString()}`;
}

/**
 * Simuleer het uploaden van foto's met voortgang (0→100). In de mock slaagt elke upload; de
 * component ondersteunt retry mocht een echte backend later falen.
 */
export async function uploadVehicleSalePhotos(
  photos: ProcessedImage[],
  onProgress?: (fraction: number) => void,
): Promise<{ uploaded: number; mock: true }> {
  const total = photos.length || 1;
  for (let i = 0; i < photos.length; i++) {
    await delay(180);
    onProgress?.((i + 1) / total);
  }
  onProgress?.(1);
  return { uploaded: photos.length, mock: true };
}

export async function submitVehicleSaleLead(payload: VehicleSalePayload): Promise<VehicleSaleResult> {
  await delay(400);
  const referenceNumber = makeRef(payload);
  // Bewust geen echte persistente opslag — alleen loggen voor demo-doeleinden.
  console.info("[MOCK] submitVehicleSaleLead", referenceNumber, {
    ...payload,
    // Geen persoonsgegevens uitgebreid loggen in productie; dit is puur demo.
  });
  return { referenceNumber, photosComplete: payload.photosComplete, mock: true };
}

export async function getVehicleSaleLead(referenceNumber: string): Promise<VehicleSaleResult | null> {
  await delay(150);
  // Mock: geen opslag → we kunnen niets teruggeven. In productie: GET op de referentie.
  console.info("[MOCK] getVehicleSaleLead", referenceNumber);
  return null;
}
