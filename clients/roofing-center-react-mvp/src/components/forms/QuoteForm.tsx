import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Send, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass, errorClass, descriptionClass } from "@/components/forms/fieldStyles";
import { services } from "@/data/services";
import { company } from "@/data/company";
import { leadAdapter, type LeadPayload } from "@/lib/leadAdapter";

const requestTypes = [
  { value: "inspectie", label: "Dakinspectie" },
  { value: "offerte", label: "Offerte" },
  { value: "lekkage", label: "Lekkage" },
  { value: "renovatie", label: "Renovatie" },
  { value: "onderhoud", label: "Onderhoud" },
  { value: "anders", label: "Anders" },
];

const schema = z.object({
  naam: z.string().min(1, "Vul uw naam in."),
  telefoon: z.string().min(1, "Vul een telefoonnummer in.").refine((v) => v.replace(/\D/g, "").length >= 9, "Vul een geldig telefoonnummer in."),
  email: z.string().min(1, "Vul uw e-mailadres in.").email("Vul een geldig e-mailadres in."),
  postcode: z.string().regex(/^\d{4}\s?[a-zA-Z]{2}$/, "Vul een geldige postcode in (bijv. 1311 AB)."),
  plaats: z.string().min(1, "Vul een plaats in."),
  typeAanvraag: z.string().min(1, "Maak een keuze."),
  lekkage: z.string().min(1, "Maak een keuze."),
  werkzaamheden: z.array(z.string()).min(1, "Kies minimaal één onderwerp."),
  bericht: z.string().max(1500, "Maximaal 1500 tekens.").optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v === true, "Geef toestemming om de aanvraag te versturen."),
  // Honeypot — must stay empty (bots fill it).
  website: z.string().max(0).optional().or(z.literal("")),
});

type QuoteValues = z.infer<typeof schema>;

export function QuoteForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { werkzaamheden: [], lekkage: "", typeAanvraag: "", consent: false, website: "" },
  });
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [uploads, setUploads] = useState<{ name: string; size: number; type: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const ids = {
    naam: useId(), tel: useId(), email: useId(), pc: useId(), plaats: useId(),
    type: useId(), bericht: useId(), consent: useId(),
  };

  const onSubmit = async (values: QuoteValues): Promise<void> => {
    if (values.website && values.website.length > 0) return; // honeypot tripped
    const payload: LeadPayload = {
      source: "quote-form",
      fields: {
        Naam: values.naam, Telefoon: values.telefoon, "E-mail": values.email,
        Postcode: values.postcode, Plaats: values.plaats,
        "Type aanvraag": values.typeAanvraag, "Actieve lekkage": values.lekkage,
        Werkzaamheden: values.werkzaamheden, Bericht: values.bericht,
      },
      attachments: uploads,
      submittedAt: new Date().toISOString(),
      consent: values.consent,
    };
    const res = await leadAdapter.submit(payload);
    if (res.ok) setDone({ reference: res.reference });
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-soft">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-soft text-green-strong">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-text-strong">Bedankt voor uw aanvraag</h2>
        <p className="mx-auto mt-2 max-w-prose text-sm text-text-muted">
          Dit is een demoformulier — er is nog geen echte verzending gekoppeld, dus er is geen e-mail verstuurd.
          In de definitieve website ontvangt {company.name} uw aanvraag en nemen we contact met u op.
        </p>
        <p className="mt-2 text-xs text-text-muted">Referentie: <span className="font-mono">{done.reference}</span></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={ids.naam} label="Naam" error={errors.naam?.message}>
          <input id={ids.naam} autoComplete="name" className={inputClass} aria-invalid={!!errors.naam} {...register("naam")} />
        </Field>
        <Field id={ids.tel} label="Telefoonnummer" error={errors.telefoon?.message}>
          <input id={ids.tel} type="tel" inputMode="tel" autoComplete="tel" className={inputClass} aria-invalid={!!errors.telefoon} {...register("telefoon")} />
        </Field>
        <Field id={ids.email} label="E-mailadres" error={errors.email?.message}>
          <input id={ids.email} type="email" inputMode="email" autoComplete="email" className={inputClass} aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field id={ids.pc} label="Postcode" error={errors.postcode?.message}>
          <input id={ids.pc} autoComplete="postal-code" placeholder="1311 AB" className={inputClass} aria-invalid={!!errors.postcode} {...register("postcode")} />
        </Field>
        <Field id={ids.plaats} label="Plaats" error={errors.plaats?.message}>
          <input id={ids.plaats} autoComplete="address-level2" className={inputClass} aria-invalid={!!errors.plaats} {...register("plaats")} />
        </Field>
        <Field id={ids.type} label="Type aanvraag" error={errors.typeAanvraag?.message}>
          <select id={ids.type} className={inputClass} aria-invalid={!!errors.typeAanvraag} defaultValue="" {...register("typeAanvraag")}>
            <option value="" disabled>Maak een keuze…</option>
            {requestTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      </div>

      {/* Active leakage */}
      <fieldset aria-invalid={!!errors.lekkage}>
        <legend className={labelClass}>Is er sprake van actieve lekkage? <span className="text-error">*</span></legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[{ v: "ja", l: "Ja" }, { v: "nee", l: "Nee" }, { v: "onbekend", l: "Weet ik niet" }].map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm hover:bg-surface-muted">
              <input type="radio" value={o.v} className="h-4 w-4 accent-[hsl(var(--green-strong))]" {...register("lekkage")} />
              {o.l}
            </label>
          ))}
        </div>
        {errors.lekkage && <p role="alert" className={`mt-1 ${errorClass}`}>{errors.lekkage.message}</p>}
      </fieldset>

      {/* Desired work (multi) */}
      <fieldset aria-invalid={!!errors.werkzaamheden}>
        <legend className={labelClass}>Gewenste werkzaamheden <span className="text-error">*</span></legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <label key={s.slug} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:bg-surface-muted">
              <input type="checkbox" value={s.slug} className="h-4 w-4 accent-[hsl(var(--green-strong))]" {...register("werkzaamheden")} />
              {s.title}
            </label>
          ))}
        </div>
        {errors.werkzaamheden && <p role="alert" className={`mt-1 ${errorClass}`}>{errors.werkzaamheden.message}</p>}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor={ids.bericht} className={labelClass}>Bericht (optioneel)</label>
        <textarea id={ids.bericht} rows={4} placeholder="Beschrijf kort uw situatie. Deel geen gevoelige gegevens." className={inputClass} {...register("bericht")} />
        {errors.bericht && <p role="alert" className={errorClass}>{errors.bericht.message}</p>}
      </div>

      {/* Photo upload UI */}
      <div className="space-y-1.5">
        <span className={labelClass}>Foto's toevoegen (optioneel)</span>
        <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only"
          onChange={(e) => setUploads(Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size, type: f.type })))} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface px-3.5 py-3 text-sm font-medium text-text-strong hover:border-green hover:bg-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <Upload className="h-4 w-4" aria-hidden="true" />
          {uploads.length > 0 ? `${uploads.length} foto('s) geselecteerd` : "Foto's kiezen"}
        </button>
        <p className={descriptionClass}>In deze demo worden alleen bestandsnamen bewaard; er worden geen bestanden verzonden.</p>
      </div>

      {/* Honeypot (visually hidden, not focusable) */}
      <div aria-hidden="true" className="hidden">
        <label>Laat dit veld leeg<input tabIndex={-1} autoComplete="off" {...register("website")} /></label>
      </div>

      {/* Consent */}
      <div className="rounded-xl border border-line bg-surface-muted p-4">
        <label htmlFor={ids.consent} className="flex items-start gap-3 text-sm text-text-body">
          <input id={ids.consent} type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(var(--green-strong))]" aria-invalid={!!errors.consent} {...register("consent")} />
          <span>Ik geef toestemming dat {company.name} mijn gegevens gebruikt om contact met mij op te nemen over deze aanvraag.</span>
        </label>
        {errors.consent && <p role="alert" className={`mt-1 ${errorClass}`}>{errors.consent.message}</p>}
      </div>

      <p className="flex items-start gap-2 text-xs text-text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-green-strong" aria-hidden="true" />
        Op basis van uw aanvraag kan Roofing Center de mogelijkheden beoordelen. Een definitief advies is pas mogelijk na inspectie.
      </p>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Versturen…" : "Aanvraag versturen"}
      </Button>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>{label} <span className="text-error">*</span></label>
      {children}
      {error && <p role="alert" className={errorClass}>{error}</p>}
    </div>
  );
}
