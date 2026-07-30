import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Loader2,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Phone,
  Pencil,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { KentekenInput } from "@/components/KentekenInput";
import { KentekenPlate } from "@/components/ui/KentekenPlate";
import { ProgressSteps } from "@/components/afspraak/ProgressSteps";
import { AvailabilityCalendar } from "@/components/afspraak/AvailabilityCalendar";
import { TimeSlots } from "@/components/afspraak/TimeSlots";
import { field } from "@/components/forms/fieldStyles";
import { werkzaamheden, werkzaamheidLabel, totalDuration } from "@/data/werkzaamheden";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { lookupKenteken, RdwError } from "@/services/rdwService";
import { createAppointment, formatChosen, AVAILABILITY_IS_MOCK } from "@/services/planningService";
import type { Vehicle } from "@/lib/rdw";
import { isValidKenteken } from "@/lib/kenteken";
import { isValidPhoneNL, isValidEmail } from "@/lib/validation";
import { usePersistentState } from "@/hooks/usePersistentState";
import { cn } from "@/utils/cn";

const STEPS = ["Voertuig", "Werkzaamheden", "Datum & tijd", "Contact", "Controle"];

interface AfspraakData {
  step: number;
  kenteken: string;
  vehicle: Vehicle | null;
  vehicleConfirmed: boolean;
  unknownKenteken: boolean;
  manual: { merk: string; model: string; bouwjaar: string };
  mileage: string;
  services: string[];
  date: string | null;
  time: string | null;
  customer: { naam: string; telefoon: string; email: string; vervangendVervoer: string; bericht: string };
}

const initial: AfspraakData = {
  step: 1,
  kenteken: "",
  vehicle: null,
  vehicleConfirmed: false,
  unknownKenteken: false,
  manual: { merk: "", model: "", bouwjaar: "" },
  mileage: "",
  services: [],
  date: null,
  time: null,
  customer: { naam: "", telefoon: "", email: "", vervangendVervoer: "geen", bericht: "" },
};

const MockBanner = () => (
  <div className="flex items-start gap-2.5 rounded-lg border border-status-reserved/30 bg-status-reserved/10 px-4 py-3">
    <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-reserved" aria-hidden />
    <p className="text-sm text-text-body">
      De getoonde beschikbaarheid is een <strong>indicatie</strong> en nog geen live werkplaatsagenda.
      Na uw aanvraag nemen wij contact op om de afspraak definitief te bevestigen.
    </p>
  </div>
);

export function AfspraakPage() {
  const [params] = useSearchParams();
  const [data, setData, clear] = usePersistentState<AfspraakData>("fia-afspraak", initial);
  const set = (patch: Partial<AfspraakData>) => setData((d) => ({ ...d, ...patch }));

  // Prefill uit URL (?kenteken= / ?dienst=) — eenmalig.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    const k = params.get("kenteken");
    const dienst = params.get("dienst");
    setData((d) => ({
      ...d,
      kenteken: k && !d.kenteken ? k.toUpperCase() : d.kenteken,
      services: dienst && d.services.length === 0 && werkzaamheden.some((w) => w.id === dienst) ? [dienst] : d.services,
    }));
  }, [params, setData]);

  const goto = (step: number) => set({ step });
  const next = () => set({ step: Math.min(data.step + 1, 5) });
  const prev = () => set({ step: Math.max(data.step - 1, 1) });

  const canProceed = ((): boolean => {
    switch (data.step) {
      case 1:
        return (data.vehicleConfirmed && !!data.vehicle) || (data.unknownKenteken && data.manual.merk.trim() !== "" && data.manual.bouwjaar.trim() !== "");
      case 2:
        return data.services.length > 0;
      case 3:
        return !!data.date && !!data.time;
      case 4:
        return data.customer.naam.trim() !== "" && isValidPhoneNL(data.customer.telefoon);
      default:
        return true;
    }
  })();

  return (
    <>
      <SEO
        title="Afspraak maken — APK, onderhoud of reparatie"
        description="Plan online uw APK, onderhoud of reparatie bij Fix-it All in Utrecht. Voer uw kenteken in en kies een moment dat u past."
        path="/afspraak"
      />

      <Section tone="muted" size="md">
        <Container className="max-w-3xl">
          <div className="mb-6">
            <p className="eyebrow">Afspraak maken</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-text-strong sm:text-4xl">Plan uw bezoek</h1>
          </div>

          <ProgressSteps steps={STEPS} current={data.step} onGoto={goto} />

          <div className="mt-6 rounded-2xl border border-line bg-paper p-5 shadow-soft sm:p-7">
            {data.step === 1 && <StepVoertuig data={data} set={set} />}
            {data.step === 2 && <StepWerkzaamheden data={data} set={set} />}
            {data.step === 3 && <StepPlanning data={data} set={set} />}
            {data.step === 4 && <StepContact data={data} set={set} />}
            {data.step === 5 && <StepControle data={data} goto={goto} clear={clear} />}

            {data.step < 5 && (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
                <Button variant="ghost" onClick={prev} disabled={data.step === 1} className={cn(data.step === 1 && "invisible")}>
                  <ChevronLeft className="h-4 w-4" aria-hidden /> Vorige
                </Button>
                <Button onClick={next} disabled={!canProceed}>
                  Volgende <ChevronRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            )}
          </div>

          <p className="mt-4 text-center font-mono text-2xs text-text-muted">
            Liever bellen?{" "}
            <a href={company.phone.href} className="text-petrol hover:underline">
              {company.phone.display}
            </a>
          </p>
        </Container>
      </Section>
    </>
  );
}

/* ----------------------------- Stap 1: Voertuig ----------------------------- */
function StepVoertuig({ data, set }: { data: AfspraakData; set: (p: Partial<AfspraakData>) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setError(null);
    if (!isValidKenteken(data.kenteken)) {
      setError("Voer een geldig Nederlands kenteken in.");
      return;
    }
    setLoading(true);
    try {
      const vehicle = await lookupKenteken(data.kenteken);
      set({ vehicle, vehicleConfirmed: false, unknownKenteken: false });
    } catch (err) {
      const code = err instanceof RdwError ? err.code : "network";
      setError(
        code === "not_found"
          ? "Geen voertuig gevonden bij dit kenteken. Controleer het of vul de gegevens handmatig in."
          : code === "invalid_kenteken"
            ? "Dit kenteken lijkt niet te kloppen."
            : "Kon de RDW-gegevens nu niet ophalen. Probeer het opnieuw of vul handmatig in.",
      );
      set({ vehicle: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Om welke auto gaat het?</h2>
      <p className="mt-1 text-sm text-text-muted">Voer uw kenteken in — wij halen de voertuiggegevens op bij de RDW.</p>

      {!data.unknownKenteken && (
        <div className="mt-5">
          <label htmlFor="afspraak-kenteken" className={field.label}>Kenteken</label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <KentekenInput
              id="afspraak-kenteken"
              value={data.kenteken}
              onValueChange={(v) => set({ kenteken: v })}
              size="md"
              aria-label="Kenteken"
              aria-invalid={!!error}
            />
            <Button onClick={search} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
              Zoek voertuig
            </Button>
          </div>
          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-error" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {error}
            </p>
          )}
        </div>
      )}

      {/* Gevonden voertuig */}
      {data.vehicle && !data.unknownKenteken && (
        <div className="mt-5 rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <KentekenPlate value={data.vehicle.kenteken} size="sm" />
            {data.vehicleConfirmed && (
              <span className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-success">
                <Check className="h-4 w-4" aria-hidden /> Bevestigd
              </span>
            )}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Spec label="Merk" value={data.vehicle.merk} />
            <Spec label="Model" value={data.vehicle.handelsbenaming} />
            <Spec label="Brandstof" value={data.vehicle.brandstof} />
            <Spec label="Soort" value={data.vehicle.voertuigsoort} />
            <Spec label="1e toelating" value={data.vehicle.datumEersteToelating} />
            <Spec label="APK tot" value={data.vehicle.vervaldatumApk} />
          </dl>
          {!data.vehicleConfirmed && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm font-semibold text-text-strong">Is dit uw auto?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => set({ vehicleConfirmed: true })}>
                  <Check className="h-4 w-4" aria-hidden /> Ja, dit klopt
                </Button>
                <Button size="sm" variant="ghost" onClick={() => set({ vehicle: null, kenteken: "" })}>
                  Nee, ander kenteken
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kilometerstand */}
      {(data.vehicleConfirmed || data.unknownKenteken) && (
        <div className="mt-5 max-w-xs">
          <label htmlFor="afspraak-km" className={field.label}>
            Kilometerstand <span className="font-normal text-text-muted">(optioneel)</span>
          </label>
          <input
            id="afspraak-km"
            inputMode="numeric"
            value={data.mileage}
            onChange={(e) => set({ mileage: e.target.value.replace(/[^\d]/g, "") })}
            placeholder="bijv. 148000"
            className={field.input}
          />
        </div>
      )}

      {/* Onbekend kenteken → handmatig */}
      <div className="mt-6">
        {!data.unknownKenteken ? (
          <button
            type="button"
            onClick={() => set({ unknownKenteken: true, vehicle: null, vehicleConfirmed: false })}
            className="text-sm font-semibold text-petrol hover:underline"
          >
            Ik weet mijn kenteken niet
          </button>
        ) : (
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-text-strong">Voertuig handmatig invullen</h3>
              <button type="button" onClick={() => set({ unknownKenteken: false })} className="text-sm text-petrol hover:underline">
                Toch kenteken gebruiken
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="m-merk" className={field.label}>Merk</label>
                <input id="m-merk" value={data.manual.merk} onChange={(e) => set({ manual: { ...data.manual, merk: e.target.value } })} className={field.input} placeholder="bijv. Volkswagen" />
              </div>
              <div>
                <label htmlFor="m-model" className={field.label}>Model</label>
                <input id="m-model" value={data.manual.model} onChange={(e) => set({ manual: { ...data.manual, model: e.target.value } })} className={field.input} placeholder="bijv. Polo" />
              </div>
              <div>
                <label htmlFor="m-bj" className={field.label}>Bouwjaar</label>
                <input id="m-bj" inputMode="numeric" value={data.manual.bouwjaar} onChange={(e) => set({ manual: { ...data.manual, bouwjaar: e.target.value.replace(/[^\d]/g, "").slice(0, 4) } })} className={field.input} placeholder="bijv. 2011" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Stap 2: Werkzaamheden --------------------------- */
function StepWerkzaamheden({ data, set }: { data: AfspraakData; set: (p: Partial<AfspraakData>) => void }) {
  const toggle = (id: string) => {
    const has = data.services.includes(id);
    set({ services: has ? data.services.filter((s) => s !== id) : [...data.services, id] });
  };
  const duration = totalDuration(data.services);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Wat mogen we voor u doen?</h2>
      <p className="mt-1 text-sm text-text-muted">Kies één of meer werkzaamheden. Twijfelt u? Kies “Anders”.</p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {werkzaamheden.map((w) => {
          const Icon = w.icon;
          const active = data.services.includes(w.id);
          return (
            <li key={w.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => toggle(w.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
                  active ? "border-petrol bg-petrol-soft" : "border-line bg-surface hover:border-petrol/40",
                )}
              >
                <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", active ? "bg-petrol text-white" : "bg-surface-muted text-petrol")}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-text-strong">{w.label}</span>
                    {active && <Check className="h-4 w-4 text-petrol" aria-hidden />}
                  </span>
                  {w.description && <span className="mt-0.5 block text-xs leading-snug text-text-muted">{w.description}</span>}
                  {w.action && <span className="mt-1 inline-block font-mono text-2xs uppercase tracking-label text-petrol">{w.action}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {duration > 0 && (
        <p className="mt-4 font-mono text-2xs text-text-muted">
          Indicatieve duur: ± {Math.round((duration / 60) * 10) / 10} uur (schatting, geen toezegging).
        </p>
      )}
    </div>
  );
}

/* ---------------------------- Stap 3: Planning ---------------------------- */
function StepPlanning({ data, set }: { data: AfspraakData; set: (p: Partial<AfspraakData>) => void }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Kies datum en tijd</h2>
      <p className="mt-1 text-sm text-text-muted">Selecteer een beschikbare dag en een tijdslot.</p>

      <div className="mt-4">{AVAILABILITY_IS_MOCK && <MockBanner />}</div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <AvailabilityCalendar
          services={data.services}
          selectedDate={data.date}
          onSelect={(iso) => set({ date: iso, time: null })}
        />
        <div>
          <h3 className="mb-3 font-display text-base font-bold text-text-strong">
            {data.date ? "Beschikbare tijden" : "Kies eerst een dag"}
          </h3>
          {data.date ? (
            <TimeSlots date={data.date} services={data.services} selectedTime={data.time} onSelect={(time) => set({ time })} />
          ) : (
            <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-text-muted">
              Selecteer links een dag om de tijden te zien.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Stap 4: Contact ---------------------------- */
function StepContact({ data, set }: { data: AfspraakData; set: (p: Partial<AfspraakData>) => void }) {
  const c = data.customer;
  const upd = (patch: Partial<AfspraakData["customer"]>) => set({ customer: { ...c, ...patch } });
  const phoneInvalid = c.telefoon.trim() !== "" && !isValidPhoneNL(c.telefoon);
  const emailInvalid = c.email.trim() !== "" && !isValidEmail(c.email);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Uw gegevens</h2>
      <p className="mt-1 text-sm text-text-muted">Zodat we de afspraak kunnen bevestigen.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="c-naam" className={field.label}>Naam *</label>
          <input id="c-naam" value={c.naam} onChange={(e) => upd({ naam: e.target.value })} className={field.input} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-tel" className={field.label}>Telefoon *</label>
          <input id="c-tel" type="tel" value={c.telefoon} onChange={(e) => upd({ telefoon: e.target.value })} className={cn(field.input, phoneInvalid && field.inputError)} autoComplete="tel" aria-invalid={phoneInvalid} placeholder="06 …" />
          {phoneInvalid && <p className={field.errorText}>Voer een geldig telefoonnummer in.</p>}
        </div>
        <div>
          <label htmlFor="c-mail" className={field.label}>E-mail <span className="font-normal text-text-muted">(optioneel)</span></label>
          <input id="c-mail" type="email" value={c.email} onChange={(e) => upd({ email: e.target.value })} className={cn(field.input, emailInvalid && field.inputError)} autoComplete="email" aria-invalid={emailInvalid} />
          {emailInvalid && <p className={field.errorText}>Controleer uw e-mailadres.</p>}
        </div>
        <div>
          <label htmlFor="c-vervoer" className={field.label}>Vervangend vervoer</label>
          <select id="c-vervoer" value={c.vervangendVervoer} onChange={(e) => upd({ vervangendVervoer: e.target.value })} className={field.select}>
            <option value="geen">Niet nodig</option>
            <option value="leenfiets">Graag een leenfiets</option>
            <option value="leenscooter">Graag een leenscooter</option>
          </select>
          <p className={field.hint}>Onder voorbehoud van beschikbaarheid.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-bericht" className={field.label}>Toelichting <span className="font-normal text-text-muted">(optioneel)</span></label>
          <textarea id="c-bericht" value={c.bericht} onChange={(e) => upd({ bericht: e.target.value })} className={field.textarea} placeholder="Bijvoorbeeld een klacht of bijzonderheid." />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Stap 5: Controle ---------------------------- */
function StepControle({ data, goto, clear }: { data: AfspraakData; goto: (s: number) => void; clear: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const voertuig = data.vehicle
    ? `${data.vehicle.merk} ${data.vehicle.handelsbenaming} (${data.vehicle.kenteken})`
    : `${data.manual.merk} ${data.manual.model} ${data.manual.bouwjaar}`.trim();

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await createAppointment({
        vehicle: data.vehicle
          ? {
              kenteken: data.vehicle.kenteken,
              merk: data.vehicle.merk,
              handelsbenaming: data.vehicle.handelsbenaming,
              brandstof: data.vehicle.brandstof,
              vervaldatumApk: data.vehicle.vervaldatumApk,
            }
          : null,
        mileage: data.mileage,
        services: data.services,
        date: data.date!,
        time: data.time!,
        customer: {
          naam: data.customer.naam,
          telefoon: data.customer.telefoon,
          email: data.customer.email || undefined,
          vervangendVervoer: data.customer.vervangendVervoer as "geen" | "leenfiets" | "leenscooter",
          bericht: data.customer.bericht || undefined,
        },
      });
      setResult({ id: res.id });
      clear();
    } catch {
      setError("Er ging iets mis bij het versturen. Probeer het opnieuw of bel ons.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="py-4 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold text-text-strong">Aanvraag ontvangen</h2>
        <p className="mx-auto mt-2 max-w-md text-text-muted">
          Bedankt! Wij nemen contact op om uw afspraak <strong>{formatChosen(data.date!, data.time!)}</strong> definitief
          te bevestigen. Uw referentie is <span className="font-mono text-text-strong">{result.id}</span>.
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs text-text-muted">
          Let op: dit is een aanvraag op basis van indicatieve beschikbaarheid, nog geen bevestigde
          werkplaatsafspraak.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button to={paths.home}>Naar de homepage</Button>
          <Button href={company.phone.href} variant="outline">
            <Phone className="h-4 w-4" aria-hidden /> {company.phone.display}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Controleer uw aanvraag</h2>
      <p className="mt-1 text-sm text-text-muted">Klopt alles? Verstuur dan uw aanvraag.</p>

      <dl className="mt-5 divide-y divide-line rounded-xl border border-line bg-surface">
        <Row label="Voertuig" value={voertuig || "—"} onEdit={() => goto(1)} extra={data.mileage ? `${Number(data.mileage).toLocaleString("nl-NL")} km` : undefined} />
        <Row label="Werkzaamheden" value={data.services.map(werkzaamheidLabel).join(", ") || "—"} onEdit={() => goto(2)} />
        <Row label="Datum & tijd" value={data.date && data.time ? formatChosen(data.date, data.time) : "—"} onEdit={() => goto(3)} />
        <Row
          label="Contact"
          value={`${data.customer.naam} · ${data.customer.telefoon}${data.customer.email ? ` · ${data.customer.email}` : ""}`}
          onEdit={() => goto(4)}
          extra={data.customer.vervangendVervoer !== "geen" ? `Vervangend vervoer: ${data.customer.vervangendVervoer}` : undefined}
        />
      </dl>

      <div className="mt-5"><MockBanner /></div>

      {error && (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-error" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden /> {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
        <Button variant="ghost" onClick={() => goto(4)}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Vorige
        </Button>
        <Button onClick={submit} disabled={submitting} size="lg">
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Check className="h-5 w-5" aria-hidden />}
          Aanvraag versturen
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-text-muted">
        Door te versturen gaat u ermee akkoord dat wij contact met u opnemen over deze afspraak. Zie ons{" "}
        <Link to={paths.contact} className="text-petrol hover:underline">contact</Link>.
      </p>
    </div>
  );
}

/* ------------------------------- Helpers ------------------------------- */
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-2xs uppercase tracking-label text-text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-text-strong">{value || "—"}</dd>
    </div>
  );
}

function Row({ label, value, onEdit, extra }: { label: string; value: string; onEdit: () => void; extra?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <dt className="font-mono text-2xs uppercase tracking-label text-text-muted">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-text-strong">{value}</dd>
        {extra && <dd className="text-xs text-text-muted">{extra}</dd>}
      </div>
      <button type="button" onClick={onEdit} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-mono text-2xs uppercase tracking-label text-petrol hover:bg-petrol-soft">
        <Pencil className="h-3 w-3" aria-hidden /> Wijzig
      </button>
    </div>
  );
}
