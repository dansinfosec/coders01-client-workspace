import { useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  ShieldCheck,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { KentekenInput } from "@/components/KentekenInput";
import { KentekenPlate } from "@/components/ui/KentekenPlate";
import { ProgressSteps } from "@/components/afspraak/ProgressSteps";
import { ChoiceCards } from "@/components/verkopen/ChoiceCards";
import { PhotoUpload } from "@/components/verkopen/PhotoUpload";
import { field } from "@/components/forms/fieldStyles";
import { company } from "@/data/company";
import { features } from "@/config/features";
import { paths } from "@/routes/paths";
import { conditionGroups, choiceLabel } from "@/data/vehicleSale";
import { lookupKenteken, RdwError } from "@/services/rdwService";
import {
  submitVehicleSaleLead,
  uploadVehicleSalePhotos,
  VEHICLE_SALE_IS_MOCK,
  type VehicleSalePayload,
} from "@/services/vehicleSaleService";
import { MIN_PHOTOS_COMPLETE, type ProcessedImage } from "@/lib/image";
import type { Vehicle } from "@/lib/rdw";
import { isValidKenteken } from "@/lib/kenteken";
import { isValidPhoneNL, isValidEmail, isValidPostcodeNL } from "@/lib/validation";
import { usePersistentState } from "@/hooks/usePersistentState";
import { cn } from "@/utils/cn";

const STEPS = ["Voertuig", "Staat", "Foto's", "Contact", "Controle"];

interface SaleData {
  step: number;
  kenteken: string;
  vehicle: Vehicle | null;
  vehicleConfirmed: boolean;
  unknownKenteken: boolean;
  manual: { merk: string; model: string; uitvoering: string; bouwjaar: string };
  mileage: string;
  condition: Record<string, string>;
  damageDescription: string;
  expectedPrice: string;
  laatsteOnderhoud: string;
  toelichting: string;
  contact: {
    naam: string;
    telefoon: string;
    email: string;
    postcode: string;
    woonplaats: string;
    klanttype: "particulier" | "zakelijk";
    belvoorkeur: "ochtend" | "middag" | "avond" | "geen";
    whatsapp: boolean;
    privacyAkkoord: boolean;
  };
}

const initial: SaleData = {
  step: 1,
  kenteken: "",
  vehicle: null,
  vehicleConfirmed: false,
  unknownKenteken: false,
  manual: { merk: "", model: "", uitvoering: "", bouwjaar: "" },
  mileage: "",
  condition: {},
  damageDescription: "",
  expectedPrice: "",
  laatsteOnderhoud: "",
  toelichting: "",
  contact: {
    naam: "",
    telefoon: "",
    email: "",
    postcode: "",
    woonplaats: "",
    klanttype: "particulier",
    belvoorkeur: "geen",
    whatsapp: false,
    privacyAkkoord: false,
  },
};

const detailTriggerGroups = conditionGroups.filter((g) => g.requiresDetailWhen);
const needsDamageDetail = (condition: Record<string, string>): boolean =>
  detailTriggerGroups.some((g) => g.requiresDetailWhen!.includes(condition[g.key] ?? ""));

const REQUIRED_CONDITION_KEYS = [
  "transmissie",
  "onderhoudshistorie",
  "rijdt",
  "technischeGebreken",
  "zichtbareSchade",
  "verkooptermijn",
];

const NoPromiseBanner = () => (
  <div className="flex items-start gap-2.5 rounded-lg border border-petrol/25 bg-petrol-soft px-4 py-3">
    <Info className="mt-0.5 h-4 w-4 shrink-0 text-petrol-strong" aria-hidden />
    <p className="text-sm text-text-body">
      U zit nergens aan vast. Wij doen <strong>geen</strong> automatische taxatie: onze verkoopadviseur bekijkt uw
      gegevens persoonlijk en belt u terug voor een <strong>vrijblijvend</strong> bod.
    </p>
  </div>
);

export function AutoVerkopenPage() {
  const [data, setData, clear] = usePersistentState<SaleData>("autostarter-verkopen", initial);
  // Foto's bevatten File-objecten en kunnen niet in sessionStorage → aparte, niet-persistente state.
  const [photos, setPhotos] = useState<ProcessedImage[]>([]);
  const set = (patch: Partial<SaleData>) => setData((d) => ({ ...d, ...patch }));

  const goto = (step: number) => set({ step });
  const next = () => set({ step: Math.min(data.step + 1, 5) });
  const prev = () => set({ step: Math.max(data.step - 1, 1) });

  const canProceed = ((): boolean => {
    switch (data.step) {
      case 1:
        return (
          (data.vehicleConfirmed && !!data.vehicle) ||
          (data.unknownKenteken && data.manual.merk.trim() !== "" && data.manual.bouwjaar.trim() !== "")
        );
      case 2:
        return (
          REQUIRED_CONDITION_KEYS.every((k) => (data.condition[k] ?? "") !== "") &&
          (!needsDamageDetail(data.condition) || data.damageDescription.trim() !== "")
        );
      case 3:
        return true; // foto's zijn aanbevolen, niet verplicht
      case 4:
        return (
          data.contact.naam.trim() !== "" &&
          isValidPhoneNL(data.contact.telefoon) &&
          data.contact.privacyAkkoord &&
          (data.contact.postcode.trim() === "" || isValidPostcodeNL(data.contact.postcode))
        );
      default:
        return true;
    }
  })();

  return (
    <>
      <SEO
        title={`Auto verkopen in ${company.address.city} — vraag een vrijblijvend bod aan`}
        description={`Meld uw auto aan bij ${company.name} in ${company.address.city}. Wij bekijken de gegevens en nemen persoonlijk contact met u op over een mogelijk vrijblijvend bod. U zit nergens aan vast.`}
        path="/auto-verkopen"
      />

      <Section tone="muted" size="md">
        <Container className="max-w-3xl">
          <div className="mb-6">
            <p className="eyebrow">Auto verkopen</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-text-strong sm:text-4xl">
              Vraag een vrijblijvend bod aan
            </h1>
            <p className="mt-2 text-text-muted">
              Meld uw auto aan. Wij bekijken de gegevens en nemen persoonlijk contact met u op.
            </p>
          </div>

          <ProgressSteps steps={STEPS} current={data.step} onGoto={goto} />

          <div className="mt-6 rounded-2xl border border-line bg-paper p-5 shadow-soft sm:p-7">
            {data.step === 1 && <StepVoertuig data={data} set={set} />}
            {data.step === 2 && <StepStaat data={data} set={set} />}
            {data.step === 3 && <StepFotos onPhotos={setPhotos} count={photos.length} />}
            {data.step === 4 && <StepContact data={data} set={set} />}
            {data.step === 5 && (
              <StepControle data={data} photos={photos} goto={goto} clear={clear} resetPhotos={() => setPhotos([])} />
            )}

            {data.step < 5 && (
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
                <Button variant="ghost" onClick={prev} className={cn(data.step === 1 && "invisible")}>
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
function StepVoertuig({ data, set }: { data: SaleData; set: (p: Partial<SaleData>) => void }) {
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
          <label htmlFor="verkoop-kenteken" className={field.label}>Kenteken</label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <KentekenInput
              id="verkoop-kenteken"
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

      {(data.vehicleConfirmed || data.unknownKenteken) && (
        <div className="mt-5 max-w-xs">
          <label htmlFor="verkoop-km" className={field.label}>
            Kilometerstand <span className="font-normal text-text-muted">(bij benadering)</span>
          </label>
          <input
            id="verkoop-km"
            inputMode="numeric"
            value={data.mileage}
            onChange={(e) => set({ mileage: e.target.value.replace(/[^\d]/g, "") })}
            placeholder="bijv. 148000"
            className={field.input}
          />
        </div>
      )}

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
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="v-merk" className={field.label}>Merk *</label>
                <input id="v-merk" value={data.manual.merk} onChange={(e) => set({ manual: { ...data.manual, merk: e.target.value } })} className={field.input} placeholder="bijv. Volkswagen" />
              </div>
              <div>
                <label htmlFor="v-model" className={field.label}>Model</label>
                <input id="v-model" value={data.manual.model} onChange={(e) => set({ manual: { ...data.manual, model: e.target.value } })} className={field.input} placeholder="bijv. Polo" />
              </div>
              <div>
                <label htmlFor="v-uitv" className={field.label}>Uitvoering <span className="font-normal text-text-muted">(optioneel)</span></label>
                <input id="v-uitv" value={data.manual.uitvoering} onChange={(e) => set({ manual: { ...data.manual, uitvoering: e.target.value } })} className={field.input} placeholder="bijv. 1.2 TDI" />
              </div>
              <div>
                <label htmlFor="v-bj" className={field.label}>Bouwjaar *</label>
                <input id="v-bj" inputMode="numeric" value={data.manual.bouwjaar} onChange={(e) => set({ manual: { ...data.manual, bouwjaar: e.target.value.replace(/[^\d]/g, "").slice(0, 4) } })} className={field.input} placeholder="bijv. 2011" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Stap 2: Staat & onderhoud --------------------------- */
function StepStaat({ data, set }: { data: SaleData; set: (p: Partial<SaleData>) => void }) {
  const setChoice = (key: string, value: string) => set({ condition: { ...data.condition, [key]: value } });
  const showDetail = needsDamageDetail(data.condition);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Staat & onderhoud</h2>
      <p className="mt-1 text-sm text-text-muted">Kies wat het beste past. Hoe eerlijker, hoe beter wij u kunnen helpen.</p>

      <div className="mt-5 space-y-6">
        {conditionGroups.map((g) => (
          <ChoiceCards key={g.key} group={g} value={data.condition[g.key] ?? ""} onChange={(v) => setChoice(g.key, v)} />
        ))}

        {showDetail && (
          <div>
            <label htmlFor="v-schade" className={field.label}>Beschrijf de schade of het gebrek *</label>
            <textarea
              id="v-schade"
              value={data.damageDescription}
              onChange={(e) => set({ damageDescription: e.target.value })}
              className={field.textarea}
              placeholder="Bijvoorbeeld: kras op achterbumper, motorlampje brandt sinds vorige week…"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="v-onderhoud" className={field.label}>Datum laatste onderhoud <span className="font-normal text-text-muted">(optioneel)</span></label>
            <input id="v-onderhoud" type="month" value={data.laatsteOnderhoud} onChange={(e) => set({ laatsteOnderhoud: e.target.value })} className={field.input} />
          </div>
          <div>
            <label htmlFor="v-prijs" className={field.label}>Minimale prijsverwachting <span className="font-normal text-text-muted">(optioneel)</span></label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">€</span>
              <input id="v-prijs" inputMode="numeric" value={data.expectedPrice} onChange={(e) => set({ expectedPrice: e.target.value.replace(/[^\d]/g, "") })} className={cn(field.input, "pl-8")} placeholder="bijv. 3500" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="v-toelichting" className={field.label}>Toelichting <span className="font-normal text-text-muted">(optioneel)</span></label>
          <textarea id="v-toelichting" value={data.toelichting} onChange={(e) => set({ toelichting: e.target.value })} className={field.textarea} placeholder="Extra informatie die handig is om te weten." />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Stap 3: Foto's ----------------------------- */
function StepFotos({ onPhotos, count }: { onPhotos: (p: ProcessedImage[]) => void; count: number }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Foto's van uw auto</h2>
      <p className="mt-1 text-sm text-text-muted">
        Duidelijke foto's helpen ons om uw auto goed te beoordelen. Verzenden met minder mag ook.
      </p>
      <div className="mt-5">
        <PhotoUpload onChange={onPhotos} />
      </div>
      {count > 0 && count < MIN_PHOTOS_COMPLETE && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-status-reserved/30 bg-status-reserved/10 px-4 py-3 text-sm text-text-body">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-reserved" aria-hidden />
          Met minder dan {MIN_PHOTOS_COMPLETE} foto's kunnen wij nog geen goede inschatting maken; we volgen dan telefonisch op.
        </p>
      )}
    </div>
  );
}

/* ----------------------------- Stap 4: Contact ----------------------------- */
function StepContact({ data, set }: { data: SaleData; set: (p: Partial<SaleData>) => void }) {
  const c = data.contact;
  const upd = (patch: Partial<SaleData["contact"]>) => set({ contact: { ...c, ...patch } });
  const phoneInvalid = c.telefoon.trim() !== "" && !isValidPhoneNL(c.telefoon);
  const emailInvalid = c.email.trim() !== "" && !isValidEmail(c.email);
  const postcodeInvalid = c.postcode.trim() !== "" && !isValidPostcodeNL(c.postcode);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-text-strong">Uw gegevens</h2>
      <p className="mt-1 text-sm text-text-muted">Zodat wij persoonlijk contact met u kunnen opnemen.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="v-naam" className={field.label}>Naam *</label>
          <input id="v-naam" value={c.naam} onChange={(e) => upd({ naam: e.target.value })} className={field.input} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="v-tel" className={field.label}>Telefoon *</label>
          <input id="v-tel" type="tel" value={c.telefoon} onChange={(e) => upd({ telefoon: e.target.value })} className={cn(field.input, phoneInvalid && field.inputError)} autoComplete="tel" aria-invalid={phoneInvalid} placeholder="06 …" />
          {phoneInvalid && <p className={field.errorText}>Voer een geldig telefoonnummer in.</p>}
        </div>
        <div>
          <label htmlFor="v-mail" className={field.label}>E-mail <span className="font-normal text-text-muted">(optioneel)</span></label>
          <input id="v-mail" type="email" value={c.email} onChange={(e) => upd({ email: e.target.value })} className={cn(field.input, emailInvalid && field.inputError)} autoComplete="email" aria-invalid={emailInvalid} />
          {emailInvalid && <p className={field.errorText}>Controleer uw e-mailadres.</p>}
        </div>
        <div>
          <label htmlFor="v-postcode" className={field.label}>Postcode <span className="font-normal text-text-muted">(optioneel)</span></label>
          <input id="v-postcode" value={c.postcode} onChange={(e) => upd({ postcode: e.target.value })} className={cn(field.input, postcodeInvalid && field.inputError)} autoComplete="postal-code" aria-invalid={postcodeInvalid} placeholder="1234 AB" />
          {postcodeInvalid && <p className={field.errorText}>Controleer uw postcode.</p>}
        </div>
        <div>
          <label htmlFor="v-plaats" className={field.label}>Woonplaats <span className="font-normal text-text-muted">(optioneel)</span></label>
          <input id="v-plaats" value={c.woonplaats} onChange={(e) => upd({ woonplaats: e.target.value })} className={field.input} autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="v-type" className={field.label}>U bent</label>
          <select id="v-type" value={c.klanttype} onChange={(e) => upd({ klanttype: e.target.value as SaleData["contact"]["klanttype"] })} className={field.select}>
            <option value="particulier">Particulier</option>
            <option value="zakelijk">Zakelijk</option>
          </select>
        </div>
        <div>
          <label htmlFor="v-belvoorkeur" className={field.label}>Wanneer bellen we u?</label>
          <select id="v-belvoorkeur" value={c.belvoorkeur} onChange={(e) => upd({ belvoorkeur: e.target.value as SaleData["contact"]["belvoorkeur"] })} className={field.select}>
            <option value="geen">Geen voorkeur</option>
            <option value="ochtend">Ochtend</option>
            <option value="middag">Middag</option>
            <option value="avond">Avond</option>
          </select>
        </div>
      </div>

      <label className="mt-4 flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3">
        <input type="checkbox" checked={c.whatsapp} onChange={(e) => upd({ whatsapp: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[hsl(var(--petrol))]" />
        <span className="text-sm text-text-body">Ja, u mag mij ook via WhatsApp benaderen.</span>
      </label>

      <label className="mt-3 flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3">
        <input type="checkbox" checked={c.privacyAkkoord} onChange={(e) => upd({ privacyAkkoord: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[hsl(var(--petrol))]" required aria-required />
        <span className="text-sm text-text-body">
          Ik ga ermee akkoord dat mijn gegevens worden gebruikt om contact met mij op te nemen over deze aanvraag. *
        </span>
      </label>
      <p className="mt-2 text-xs text-text-muted">
        Wij gebruiken uw gegevens uitsluitend voor deze aanvraag. Geen automatische marketing.
      </p>
    </div>
  );
}

/* ---------------------------- Stap 5: Controle ---------------------------- */
function StepControle({
  data,
  photos,
  goto,
  clear,
  resetPhotos,
}: {
  data: SaleData;
  photos: ProcessedImage[];
  goto: (s: number) => void;
  clear: () => void;
  resetPhotos: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ref: string; complete: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  const voertuig = data.vehicle
    ? `${data.vehicle.merk} ${data.vehicle.handelsbenaming} (${data.vehicle.kenteken})`
    : `${data.manual.merk} ${data.manual.model} ${data.manual.uitvoering} ${data.manual.bouwjaar}`.replace(/\s+/g, " ").trim();

  const photosComplete = photos.length >= MIN_PHOTOS_COMPLETE;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setProgress(0);
    try {
      const payload: VehicleSalePayload = {
        vehicle: data.vehicle
          ? {
              kenteken: data.vehicle.kenteken,
              merk: data.vehicle.merk,
              handelsbenaming: data.vehicle.handelsbenaming,
              brandstof: data.vehicle.brandstof,
              voertuigsoort: data.vehicle.voertuigsoort,
              datumEersteToelating: data.vehicle.datumEersteToelating,
              vervaldatumApk: data.vehicle.vervaldatumApk,
            }
          : {
              kenteken: "",
              merk: data.manual.merk,
              handelsbenaming: `${data.manual.model} ${data.manual.uitvoering}`.trim(),
              brandstof: "",
              voertuigsoort: "",
              datumEersteToelating: "",
              vervaldatumApk: "",
              manual: data.manual,
            },
        mileage: data.mileage,
        condition: data.condition,
        damageDescription: data.damageDescription,
        expectedPrice: data.expectedPrice,
        laatsteOnderhoud: data.laatsteOnderhoud,
        toelichting: data.toelichting,
        photoCount: photos.length,
        photosComplete,
        contact: {
          naam: data.contact.naam,
          telefoon: data.contact.telefoon,
          email: data.contact.email || undefined,
          postcode: data.contact.postcode || undefined,
          woonplaats: data.contact.woonplaats || undefined,
          klanttype: data.contact.klanttype,
          belvoorkeur: data.contact.belvoorkeur,
          whatsapp: data.contact.whatsapp,
          privacyAkkoord: data.contact.privacyAkkoord,
        },
      };
      if (photos.length > 0) await uploadVehicleSalePhotos(photos, setProgress);
      const res = await submitVehicleSaleLead(payload);
      setResult({ ref: res.referenceNumber, complete: res.photosComplete });
      clear();
      resetPhotos();
    } catch {
      setError("Er ging iets mis bij het versturen. Probeer het opnieuw of bel ons.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="py-4 text-center" ref={liveRef}>
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold text-text-strong">Bedankt voor uw aanvraag</h2>
        <p className="mx-auto mt-2 max-w-md text-text-muted">
          Wij bekijken uw voertuiggegevens en nemen persoonlijk contact met u op over een vrijblijvend bod.
          U bent nergens toe verplicht. Uw referentie is{" "}
          <span className="font-mono text-text-strong">{result.ref}</span>.
        </p>
        {!result.complete && (
          <p className="mx-auto mt-3 max-w-md text-xs text-text-muted">
            Er zijn nog geen (of te weinig) foto's meegestuurd — we nemen hierover telefonisch contact met u op.
          </p>
        )}
        <p className="mx-auto mt-3 max-w-md text-xs text-text-muted">
          Let op: dit is een aanvraag. Er is nog geen bod uitgebracht en niets is definitief.
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
        <Row label="Voertuig" value={voertuig || "—"} onEdit={() => goto(1)} extra={data.mileage ? `± ${Number(data.mileage).toLocaleString("nl-NL")} km` : undefined} />
        <Row
          label="Staat"
          value={REQUIRED_CONDITION_KEYS.map((k) => choiceLabel(k, data.condition[k] ?? "")).filter(Boolean).join(" · ") || "—"}
          onEdit={() => goto(2)}
          extra={data.damageDescription ? `Schade/gebrek: ${data.damageDescription}` : undefined}
        />
        <Row
          label="Foto's"
          value={photos.length > 0 ? `${photos.length} foto${photos.length === 1 ? "" : "'s"}${photosComplete ? "" : " (onvolledig)"}` : "Geen foto's toegevoegd"}
          onEdit={() => goto(3)}
        />
        <Row
          label="Contact"
          value={`${data.contact.naam} · ${data.contact.telefoon}${data.contact.email ? ` · ${data.contact.email}` : ""}`}
          onEdit={() => goto(4)}
          extra={`${data.contact.klanttype === "zakelijk" ? "Zakelijk" : "Particulier"}${data.contact.belvoorkeur !== "geen" ? ` · bellen: ${data.contact.belvoorkeur}` : ""}`}
        />
      </dl>

      <div className="mt-5"><NoPromiseBanner /></div>

      {features.demoDisclaimers && VEHICLE_SALE_IS_MOCK && (
        <p className="mt-3 flex items-start gap-2 text-xs text-text-muted">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-petrol" aria-hidden />
          Demo: in deze versie wordt uw aanvraag nog niet echt opgeslagen of verzonden.
        </p>
      )}

      {submitting && photos.length > 0 && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-petrol transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="mt-1.5 font-mono text-2xs text-text-muted">Foto's verwerken… {Math.round(progress * 100)}%</p>
        </div>
      )}

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
          Vrijblijvend bod aanvragen
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-text-muted">
        Door te versturen gaat u akkoord dat wij contact met u opnemen over deze aanvraag. Zie ons{" "}
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
        {extra && <dd className="mt-0.5 text-xs text-text-muted">{extra}</dd>}
      </div>
      <button type="button" onClick={onEdit} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-mono text-2xs uppercase tracking-label text-petrol hover:bg-petrol-soft">
        <Pencil className="h-3 w-3" aria-hidden /> Wijzig
      </button>
    </div>
  );
}
