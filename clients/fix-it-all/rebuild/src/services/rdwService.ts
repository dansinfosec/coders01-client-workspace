/**
 * RDW-service (vervangbare laag). De UI roept UITSLUITEND lookupKenteken() aan.
 *
 * Route: eerst de interne proxy /api/rdw?kenteken=XX (caching, rate-limit, foutafhandeling).
 * Valt die weg (bijv. `vite dev` zonder serverless), dan direct naar RDW Open Data (CORS-enabled).
 */
import { normalizeVehicle, type Vehicle, type RdwVehicleRaw, type RdwFuelRaw } from "@/lib/rdw";
import { normalizeKenteken } from "@/lib/kenteken";

const RDW_VEHICLES = "https://opendata.rdw.nl/resource/m9d7-ebf2.json";
const RDW_FUEL = "https://opendata.rdw.nl/resource/8ys7-d773.json";

export type RdwErrorCode = "invalid_kenteken" | "not_found" | "network";

export class RdwError extends Error {
  code: RdwErrorCode;
  constructor(code: RdwErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "RdwError";
  }
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new RdwError("network", `HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function viaProxy(kenteken: string, signal?: AbortSignal): Promise<Vehicle | null> {
  const res = await fetch(`/api/rdw?kenteken=${encodeURIComponent(kenteken)}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (res.status === 404 || res.status === 501) throw new RdwError("network", "proxy_unavailable");
  if (!res.ok) throw new RdwError("network", `proxy ${res.status}`);
  const data = (await res.json()) as { vehicle?: RdwVehicleRaw[]; fuel?: RdwFuelRaw[] };
  return normalizeVehicle(kenteken, data.vehicle?.[0], data.fuel);
}

async function viaDirect(kenteken: string, signal?: AbortSignal): Promise<Vehicle | null> {
  const q = `?kenteken=${encodeURIComponent(kenteken)}`;
  const [vehicle, fuel] = await Promise.all([
    fetchJson<RdwVehicleRaw[]>(RDW_VEHICLES + q, signal),
    fetchJson<RdwFuelRaw[]>(RDW_FUEL + q, signal).catch(() => [] as RdwFuelRaw[]),
  ]);
  return normalizeVehicle(kenteken, vehicle[0], fuel);
}

/**
 * Zoek een voertuig op kenteken.
 * @throws RdwError("invalid_kenteken" | "not_found" | "network")
 */
export async function lookupKenteken(rawKenteken: string, signal?: AbortSignal): Promise<Vehicle> {
  const kenteken = normalizeKenteken(rawKenteken);
  if (kenteken.length < 4) throw new RdwError("invalid_kenteken");

  let vehicle: Vehicle | null = null;
  try {
    vehicle = await viaProxy(kenteken, signal);
  } catch {
    // Proxy niet beschikbaar of faalde → val terug op directe RDW-toegang.
    try {
      vehicle = await viaDirect(kenteken, signal);
    } catch (err) {
      if (err instanceof RdwError) throw err;
      throw new RdwError("network");
    }
  }

  if (!vehicle) throw new RdwError("not_found");
  return vehicle;
}
