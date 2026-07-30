import type { ReactNode } from "react";
import { Loader2, Car } from "lucide-react";
import { type RdwVehicle, vehicleTitle } from "@/lib/rdw";
import { formatApkDate } from "@/lib/kenteken";
import { PlateBadge } from "./LicensePlate";

interface Props {
  vehicle: RdwVehicle | null;
  loading: boolean;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">{label}</dt>
      <dd className="text-right text-sm font-semibold text-text-strong">{children}</dd>
    </div>
  );
}

/** Right-hand "Overzicht" card; updates automatically as a new plate is looked up. */
export function VehicleOverviewCard({ vehicle, loading }: Props) {
  const apk = formatApkDate(vehicle?.vervaldatumApk);

  return (
    <aside
      aria-live="polite"
      className="rounded-2xl border border-line bg-surface-muted p-6 shadow-soft"
    >
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        Overzicht
      </h2>

      {loading ? (
        <div className="flex items-center gap-3 py-10 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Voertuiggegevens ophalen…</span>
        </div>
      ) : vehicle ? (
        <>
          <p className="mt-3 font-display text-2xl font-extrabold leading-tight text-text-strong">
            {vehicleTitle(vehicle)}
          </p>
          <dl className="mt-4 divide-y divide-line">
            <Row label="Kenteken">
              <PlateBadge value={vehicle.kenteken} />
            </Row>
            <Row label="Vervaldatum APK">{apk || "Onbekend"}</Row>
            {vehicle.brandstof && <Row label="Brandstof">{vehicle.brandstof}</Row>}
            {vehicle.voertuigsoort && <Row label="Voertuigsoort">{vehicle.voertuigsoort}</Row>}
          </dl>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-10 text-center text-text-muted">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-surface">
            <Car className="h-6 w-6" />
          </span>
          <p className="max-w-[15rem] text-sm">
            Vul uw kenteken in om uw voertuiggegevens hier te zien.
          </p>
        </div>
      )}
    </aside>
  );
}
