import { CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { useAfspraak } from "./afspraakStore";
import { ServiceCards } from "./ServiceCards";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { TimeSlots } from "./TimeSlots";
import { vehicleTitle } from "@/lib/rdw";
import { formatChosen } from "@/lib/availability";
import { werkzaamheidLabel, totalDuration } from "@/data/werkzaamheden";
import { getLocation, defaultLocation } from "@/data/locations";
import { errorText } from "@/components/forms/fieldStyles";

const durationLabel = (min: number) => {
  if (min <= 0) return "";
  const u = Math.floor(min / 60);
  const m = min % 60;
  if (u === 0) return `± ${m} min`;
  return m === 0 ? `± ${u} uur` : `± ${u} uur ${m} min`;
};

/** Step 2 — jobs (left) + availability calendar & time (right) + chosen summary. */
export function Step2Planning({ showErrors }: { showErrors: boolean }) {
  const { data, update, toggleWerkzaamheid } = useAfspraak();
  const location = getLocation(data.locationId) ?? defaultLocation;

  const noJobs = showErrors && data.werkzaamheden.length === 0;
  const noDate = showErrors && !data.datum;
  const noTime = showErrors && Boolean(data.datum) && !data.tijd;
  const duration = totalDuration(data.werkzaamheden);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Left — jobs */}
      <section aria-labelledby="werk-heading">
        <h2 id="werk-heading" className="text-xl">Kies één of meerdere werkzaamheden</h2>
        <p className="mt-1 text-sm text-text-muted">Meerdere keuzes mogelijk.</p>
        <div className="mt-5">
          <ServiceCards
            selected={data.werkzaamheden}
            onToggle={toggleWerkzaamheid}
            toelichting={data.toelichting}
            onToelichting={(v) => update({ toelichting: v })}
            allowedIds={location.services}
          />
        </div>
        {noJobs && <p className={errorText}>Kies minimaal één werkzaamheid.</p>}
      </section>

      {/* Right — planning */}
      <section aria-labelledby="datum-heading" className="space-y-6">
        <div>
          <h2 id="datum-heading" className="text-xl">Kies een beschikbare datum</h2>
          <div className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <AvailabilityCalendar
              locationId={data.locationId}
              selectedServices={data.werkzaamheden}
              selectedDate={data.datum}
              onSelectDate={(iso) => update({ datum: iso, tijd: "" })}
            />
          </div>
          {noDate && <p className={errorText}>Kies een beschikbare datum.</p>}
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-mark" /> Kies een tijd
          </h2>
          <div className="mt-4">
            <TimeSlots
              locationId={data.locationId}
              date={data.datum}
              selectedServices={data.werkzaamheden}
              selectedTime={data.tijd}
              onSelectTime={(t) => update({ tijd: t })}
            />
          </div>
          {noTime && <p className={errorText}>Kies een beschikbaar tijdstip.</p>}
        </div>

        {/* Chosen summary */}
        <div className="rounded-2xl border border-line bg-surface-muted p-6">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Samenvatting</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {data.vehicle && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Voertuig</dt>
                <dd className="text-right font-semibold text-text-strong">
                  {vehicleTitle(data.vehicle)} · {data.kenteken}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Werkzaamheden</dt>
              <dd className="text-right font-semibold text-text-strong">
                {data.werkzaamheden.length
                  ? data.werkzaamheden.map(werkzaamheidLabel).join(", ")
                  : "—"}
              </dd>
            </div>
            {duration > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Geschatte duur</dt>
                <dd className="text-right font-semibold text-text-strong">{durationLabel(duration)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
            {data.datum && data.tijd ? (
              <p className="flex items-center gap-2 font-semibold text-text-strong">
                <CheckCircle2 className="h-5 w-5 text-pass" />
                <span>
                  <CalendarDays className="mr-1 inline h-4 w-4 text-text-muted" />
                  {formatChosen(data.datum, data.tijd)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-text-muted">Kies een datum en tijd om af te ronden.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
