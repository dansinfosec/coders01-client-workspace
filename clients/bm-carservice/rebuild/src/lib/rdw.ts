import { normalizeKenteken } from "./kenteken";

/** Normalised vehicle from the RDW Open Data. */
export interface RdwVehicle {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  voertuigsoort?: string;
  brandstof?: string;
  /** Raw APK expiry (YYYYMMDD) — format with formatApkDate(). */
  vervaldatumApk?: string;
}

export type RdwResult =
  | { status: "ok"; vehicle: RdwVehicle }
  | { status: "notfound" }
  | { status: "error"; message: string };

/** Merk + model without the common RDW duplication (handelsbenaming often includes the merk). */
export function vehicleTitle(v: RdwVehicle): string {
  const merk = v.merk.trim();
  const model = v.handelsbenaming.trim();
  if (!model) return merk;
  if (model.toUpperCase().startsWith(merk.toUpperCase())) return model;
  return `${merk} ${model}`.trim();
}

const VEHICLES = "https://opendata.rdw.nl/resource/m9d7-ebf2.json";
const FUEL = "https://opendata.rdw.nl/resource/8ys7-d773.json";
const TIMEOUT_MS = 8000;

// Cache successful lookups for the session so re-entering a plate is instant.
const cache = new Map<string, RdwVehicle>();

interface RawResponse {
  vehicle: Array<Record<string, string>>;
  fuel: Array<Record<string, string>>;
}

/** Prefer the internal proxy (production); fall back to direct RDW (CORS) in dev/preview. */
async function fetchRaw(kenteken: string, signal: AbortSignal): Promise<RawResponse> {
  try {
    const res = await fetch(`/api/rdw?kenteken=${kenteken}`, { signal });
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && type.includes("application/json")) {
      const data = (await res.json()) as Partial<RawResponse>;
      if (Array.isArray(data.vehicle)) {
        return { vehicle: data.vehicle, fuel: Array.isArray(data.fuel) ? data.fuel : [] };
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    // proxy unavailable → fall through to direct RDW
  }

  const q = `?kenteken=${encodeURIComponent(kenteken)}`;
  const [vehicle, fuel] = await Promise.all([
    fetch(VEHICLES + q, { signal }).then((r) => r.json() as Promise<RawResponse["vehicle"]>),
    fetch(FUEL + q, { signal })
      .then((r) => r.json() as Promise<RawResponse["fuel"]>)
      .catch(() => [] as RawResponse["fuel"]),
  ]);
  return { vehicle, fuel };
}

/**
 * Look up a vehicle by licence plate. Handles debounce-friendly cancellation via
 * `externalSignal`, an 8s timeout, caching, and typed error/not-found states.
 */
export async function lookupKenteken(
  raw: string,
  externalSignal?: AbortSignal,
): Promise<RdwResult> {
  const kenteken = normalizeKenteken(raw);
  if (kenteken.length < 6) return { status: "error", message: "Vul een volledig kenteken in." };

  const hit = cache.get(kenteken);
  if (hit) return { status: "ok", vehicle: hit };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onAbort);

  try {
    const { vehicle, fuel } = await fetchRaw(kenteken, controller.signal);
    if (!vehicle.length) return { status: "notfound" };

    const v = vehicle[0]!;
    const brandstof = fuel
      .map((f) => f.brandstof_omschrijving)
      .filter(Boolean)
      .join(" / ");

    const result: RdwVehicle = {
      kenteken,
      merk: v.merk ?? "",
      handelsbenaming: v.handelsbenaming ?? "",
      voertuigsoort: v.voertuigsoort || undefined,
      brandstof: brandstof || undefined,
      vervaldatumApk: v.vervaldatum_apk || undefined,
    };
    cache.set(kenteken, result);
    return { status: "ok", vehicle: result };
  } catch (err) {
    // Caller cancelled (new input) → propagate so the stale result is ignored.
    if (externalSignal?.aborted) throw err;
    const timedOut = controller.signal.aborted;
    return {
      status: "error",
      message: timedOut
        ? "De RDW reageert niet. Probeer het zo opnieuw."
        : "Kon de RDW-gegevens niet ophalen. Controleer uw verbinding.",
    };
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener("abort", onAbort);
  }
}
