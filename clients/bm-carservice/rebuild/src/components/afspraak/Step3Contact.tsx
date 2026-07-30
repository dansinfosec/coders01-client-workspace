import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAfspraak } from "./afspraakStore";
import { vehicleTitle } from "@/lib/rdw";
import { createAppointment, formatChosen } from "@/lib/availability";
import { PlateBadge } from "./LicensePlate";
import { werkzaamheidLabel } from "@/data/werkzaamheden";
import { formatKm } from "@/lib/kenteken";
import { company } from "@/data/company";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { fieldBase, labelBase, errorText } from "@/components/forms/fieldStyles";
import { cn } from "@/utils/cn";
import type { AfspraakData } from "./afspraakStore";

interface Errors {
  naam?: string;
  telefoon?: string;
  email?: string;
  privacy?: string;
}

function validate(d: AfspraakData, privacy: boolean): Errors {
  const e: Errors = {};
  if (d.naam.trim().length < 2) e.naam = "Vul uw naam in.";
  if (!/^[0-9+()\-\s]{8,}$/.test(d.telefoon)) e.telefoon = "Vul een geldig telefoonnummer in.";
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Vul een geldig e-mailadres in.";
  if (!privacy) e.privacy = "Ga akkoord om te versturen.";
  return e;
}

function buildMailto(d: AfspraakData): string {
  const lines = [
    "AFSPRAAKAANVRAAG — BM Carservice",
    "",
    `Kenteken: ${d.kenteken}`,
    d.vehicle ? `Voertuig: ${vehicleTitle(d.vehicle)}` : "",
    `Kilometerstand: ${formatKm(d.kilometerstand)} km`,
    `Werkzaamheden: ${d.werkzaamheden.map(werkzaamheidLabel).join(", ")}`,
    d.toelichting ? `Toelichting werkzaamheden: ${d.toelichting}` : "",
    d.datum && d.tijd ? `Gewenst moment: ${formatChosen(d.datum, d.tijd)}` : "",
    "",
    `Naam: ${d.naam}`,
    `Telefoon: ${d.telefoon}`,
    d.email ? `E-mail: ${d.email}` : "",
    `Vervangend vervoer: ${d.vervangendVervoer}`,
    d.bericht ? `\nOpmerking:\n${d.bericht}` : "",
  ].filter(Boolean);
  return `mailto:${company.email}?subject=${encodeURIComponent(
    `Afspraakaanvraag ${d.kenteken} — ${d.naam}`,
  )}&body=${encodeURIComponent(lines.join("\n"))}`;
}

/** Step 3 — personal & contact details, then submit (mock createAppointment + mailto fallback). */
export function Step3Contact({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { data, update } = useAfspraak();
  const [privacy, setPrivacy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const errs = validate(data, privacy);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    // Backend hook: this is where the real appointment is created (currently a MOCK, per branch).
    await createAppointment({
      locationId: data.locationId,
      vehicle: data.vehicle
        ? {
            kenteken: data.kenteken,
            merk: data.vehicle.merk,
            handelsbenaming: data.vehicle.handelsbenaming,
            brandstof: data.vehicle.brandstof,
            vervaldatumApk: data.vehicle.vervaldatumApk,
          }
        : null,
      mileage: data.kilometerstand,
      services: data.werkzaamheden,
      toelichting: data.toelichting,
      date: data.datum,
      time: data.tijd,
      customer: {
        naam: data.naam,
        telefoon: data.telefoon,
        email: data.email,
        vervangendVervoer: data.vervangendVervoer,
        bericht: data.bericht,
      },
    });
    const endpoint = company.appointmentEndpoint;
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        window.location.href = buildMailto(data);
      }
    } else {
      window.location.href = buildMailto(data);
    }
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Contact fields */}
      <div className="lg:col-span-7">
        <h2 className="text-xl">Persoons- en contactgegevens</h2>
        <div className="mt-5 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="naam" className={labelBase}>Naam *</label>
              <input id="naam" className={cn(fieldBase, errors.naam && "border-error")} value={data.naam} onChange={(e) => update({ naam: e.target.value })} autoComplete="name" />
              {errors.naam && <p className={errorText}>{errors.naam}</p>}
            </div>
            <div>
              <label htmlFor="telefoon" className={labelBase}>Telefoon *</label>
              <input id="telefoon" className={cn(fieldBase, errors.telefoon && "border-error")} value={data.telefoon} onChange={(e) => update({ telefoon: e.target.value })} autoComplete="tel" inputMode="tel" />
              {errors.telefoon && <p className={errorText}>{errors.telefoon}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="email" className={labelBase}>E-mail</label>
            <input id="email" className={cn(fieldBase, errors.email && "border-error")} value={data.email} onChange={(e) => update({ email: e.target.value })} autoComplete="email" inputMode="email" />
            {errors.email && <p className={errorText}>{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="vervoer" className={labelBase}>Vervangend vervoer?</label>
            <select id="vervoer" className={fieldBase} value={data.vervangendVervoer} onChange={(e) => update({ vervangendVervoer: e.target.value as "ja" | "nee" })}>
              <option value="nee">Nee, niet nodig</option>
              <option value="ja">Ja, graag een leenauto</option>
            </select>
          </div>
          <div>
            <label htmlFor="bericht" className={labelBase}>Opmerking</label>
            <textarea id="bericht" rows={4} className={fieldBase} value={data.bericht} onChange={(e) => update({ bericht: e.target.value })} placeholder="Iets wat we moeten weten?" />
          </div>

          <label className="flex items-start gap-3 text-sm text-text-body">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
            <span>Ik ga akkoord dat mijn gegevens gebruikt worden om contact op te nemen over deze aanvraag.</span>
          </label>
          {errors.privacy && <p className={errorText}>{errors.privacy}</p>}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={onBack}>Vorige stap</Button>
          <Button type="button" variant="mark" size="lg" onClick={submit} disabled={submitting}>
            Afspraak versturen
          </Button>
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-5">
        <div className="rounded-2xl border border-line bg-surface-muted p-6 shadow-soft lg:sticky lg:top-28">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Overzicht</h2>
          {data.vehicle && (
            <p className="mt-3 font-display text-xl font-extrabold text-text-strong">{vehicleTitle(data.vehicle)}</p>
          )}
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Kenteken</dt>
              <dd><PlateBadge value={data.kenteken} /></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Km-stand</dt>
              <dd className="font-semibold text-text-strong">{formatKm(data.kilometerstand)} km</dd>
            </div>
            {data.datum && data.tijd && (
              <div className="flex items-start justify-between gap-3">
                <dt className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Moment</dt>
                <dd className="flex items-center gap-1.5 text-right font-semibold text-text-strong">
                  <CalendarDays className="h-4 w-4 text-text-muted" /> {formatChosen(data.datum, data.tijd)}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Werkzaamheden</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.werkzaamheden.map((id) => (
                <Tag key={id} tone="outline">{werkzaamheidLabel(id)}</Tag>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
