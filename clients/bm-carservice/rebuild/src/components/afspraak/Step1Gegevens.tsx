import { useCallback, useEffect, useRef, useState } from "react";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import { useAfspraak } from "./afspraakStore";
import { PlateInput } from "./LicensePlate";
import { VehicleOverviewCard } from "./VehicleOverviewCard";
import { lookupKenteken, vehicleTitle } from "@/lib/rdw";
import { looksComplete, formatKm } from "@/lib/kenteken";
import { fieldBase, labelBase, errorText } from "@/components/forms/fieldStyles";
import { cn } from "@/utils/cn";

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "notfound" }
  | { kind: "error"; message: string };

/** Step 1 — Afspraakgegevens: vehicle lookup (RDW) + mileage + job selection. */
export function Step1Gegevens({ showErrors }: { showErrors: boolean }) {
  const { data, update } = useAfspraak();
  const [lookup, setLookup] = useState<LookupState>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const runLookup = useCallback(
    async (raw: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLookup({ kind: "loading" });
      try {
        const res = await lookupKenteken(raw, controller.signal);
        if (controller.signal.aborted) return;
        if (res.status === "ok") {
          update({ vehicle: res.vehicle });
          setLookup({ kind: "idle" });
        } else if (res.status === "notfound") {
          update({ vehicle: null });
          setLookup({ kind: "notfound" });
        } else {
          update({ vehicle: null });
          setLookup({ kind: "error", message: res.message });
        }
      } catch {
        // aborted by a newer lookup — ignore
      }
    },
    [update],
  );

  // Debounced auto-lookup once the plate looks complete (avoids unnecessary API calls).
  useEffect(() => {
    const k = data.kenteken;
    if (!looksComplete(k)) return;
    if (data.vehicle && data.vehicle.kenteken === k) return;
    const timer = setTimeout(() => runLookup(k), 600);
    return () => clearTimeout(timer);
  }, [data.kenteken, data.vehicle, runLookup]);

  // Cancel any in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const handlePlateChange = (value: string) => {
    const patch: Partial<typeof data> = { kenteken: value };
    if (data.vehicle && data.vehicle.kenteken !== value) patch.vehicle = null;
    update(patch);
    if (lookup.kind === "notfound" || lookup.kind === "error") setLookup({ kind: "idle" });
  };

  const handleSearch = () => {
    if (data.kenteken.length < 6) {
      setLookup({ kind: "error", message: "Vul een volledig kenteken in." });
      return;
    }
    runLookup(data.kenteken);
  };

  const loading = lookup.kind === "loading";
  const plateInvalid = showErrors && !data.vehicle;
  const kmInvalid = showErrors && !data.kilometerstand;

  const overview = <VehicleOverviewCard vehicle={data.vehicle} loading={loading} />;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-10 lg:col-span-7">
        {/* Vehicle input */}
        <section aria-labelledby="voertuig-heading">
          <h2 id="voertuig-heading" className="text-xl">
            Wat zijn uw voertuiggegevens?
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-[auto,1fr] sm:items-start">
            <div>
              <label htmlFor="kenteken" className={labelBase}>
                Kenteken
              </label>
              <div className="mt-2 flex items-center gap-2">
                <PlateInput
                  id="kenteken"
                  value={data.kenteken}
                  onChange={handlePlateChange}
                  onEnter={handleSearch}
                  disabled={loading}
                  aria-invalid={plateInvalid || lookup.kind === "notfound"}
                  aria-describedby="kenteken-status"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  aria-label="Kenteken opzoeken"
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-ink text-signal transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-60 sm:h-16 sm:w-16"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
              </div>

              {/* Status / errors under the plate */}
              <div id="kenteken-status" className="mt-2 min-h-5 text-sm" aria-live="polite">
                {loading && <span className="text-text-muted">Voertuig opzoeken bij de RDW…</span>}
                {!loading && lookup.kind === "notfound" && (
                  <span className="inline-flex items-center gap-1.5 text-error">
                    <AlertCircle className="h-4 w-4" /> Geen voertuig gevonden. Controleer het kenteken.
                  </span>
                )}
                {!loading && lookup.kind === "error" && (
                  <span className="inline-flex items-center gap-1.5 text-error">
                    <AlertCircle className="h-4 w-4" /> {lookup.message}
                  </span>
                )}
                {!loading && lookup.kind === "idle" && data.vehicle && (
                  <span className="text-pass">✓ {vehicleTitle(data.vehicle)} gevonden</span>
                )}
                {!loading && plateInvalid && lookup.kind === "idle" && !data.vehicle && (
                  <span className="text-error">Haal eerst uw voertuiggegevens op via het kenteken.</span>
                )}
              </div>
            </div>

            {/* Mileage */}
            <div>
              <label htmlFor="km" className={labelBase}>
                Kilometerstand
              </label>
              <div className="relative mt-2">
                <input
                  id="km"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatKm(data.kilometerstand)}
                  onChange={(e) => update({ kilometerstand: e.target.value.replace(/\D/g, "").slice(0, 7) })}
                  placeholder="125.000"
                  aria-invalid={kmInvalid}
                  className={cn(fieldBase, "pr-12", kmInvalid && "border-error")}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-sm text-text-muted">
                  Km
                </span>
              </div>
              {kmInvalid && <p className={errorText}>Vul de kilometerstand in.</p>}
            </div>
          </div>
        </section>

        {/* Mobile overview — directly under the inputs */}
        <div className="lg:hidden">{overview}</div>
      </div>

      {/* Desktop overview — sticky sidebar */}
      <div className="hidden lg:col-span-5 lg:block">
        <div className="lg:sticky lg:top-28">{overview}</div>
      </div>
    </div>
  );
}
