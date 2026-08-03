import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Upload, AlertCircle, Info } from "lucide-react";
import { business } from "@/data/business";
import { Section } from "@/components/ui/Section";

type Klanttype = "particulier" | "zakelijk";
type Voertuig = "auto" | "motor" | "scooter" | "boot" | "anders";
type Verzekering = "ja" | "nee" | "onbekend";

interface FormState {
  naam: string;
  telefoon: string;
  email: string;
  klanttype: Klanttype | "";
  voertuig: Voertuig | "";
  verzekering: Verzekering | "";
  omschrijving: string;
  privacy: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  naam: "", telefoon: "", email: "", klanttype: "", voertuig: "",
  verzekering: "", omschrijving: "", privacy: false,
};

// Focus order for jumping to the first invalid field.
const FIELD_ORDER: (keyof FormState)[] = [
  "naam", "telefoon", "email", "klanttype", "voertuig", "verzekering", "omschrijving", "privacy",
];

const fieldAnchorId: Partial<Record<keyof FormState, string>> = {
  naam: "naam",
  telefoon: "telefoon",
  email: "email",
  klanttype: "klanttype-particulier",
  voertuig: "voertuig",
  verzekering: "verzekering-ja",
  omschrijving: "omschrijving",
  privacy: "privacy",
};

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.naam.trim()) e.naam = "Vul uw naam in.";
  if (!f.telefoon.trim()) {
    e.telefoon = "Vul uw telefoonnummer in.";
  } else if (!/^[+\d][\d\s()-]{6,}$/.test(f.telefoon.trim())) {
    e.telefoon = "Vul een geldig telefoonnummer in.";
  }
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
    e.email = "Vul een geldig e-mailadres in.";
  }
  if (!f.klanttype) e.klanttype = "Kies particulier of zakelijk.";
  if (!f.voertuig) e.voertuig = "Kies een voertuigtype.";
  if (!f.verzekering) e.verzekering = "Geef aan of het om verzekeringsschade gaat.";
  if (!f.omschrijving.trim()) e.omschrijving = "Omschrijf kort de schade.";
  if (!f.privacy) e.privacy = "U dient akkoord te gaan met de privacyverklaring.";
  return e;
}

const inputBase =
  "mt-1.5 block w-full rounded-lg border bg-surface px-4 py-2.5 text-text-strong " +
  "placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-focus";

export function SchadeForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = FIELD_ORDER.find((k) => errs[k]);
      if (first) document.getElementById(fieldAnchorId[first] ?? first)?.focus();
      return;
    }
    // Submit layer is configurable. In preview mode ("demo") nothing is sent and
    // no photos are uploaded — see PREVIEW-NOTE.md. A real backend endpoint can be
    // wired via business.leadConfig.
    if (business.leadConfig.submitMode === "endpoint" && business.leadConfig.endpoint) {
      void business.leadConfig.endpoint; // real POST would happen here in production
    }
    setSubmitted(true);
  };

  const err = (k: keyof FormState) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-error">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        {errors[k]}
      </p>
    ) : null;

  const aria = (k: keyof FormState) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });

  if (submitted) {
    return (
      <Section id="aanvraag" aria-labelledby="aanvraag-title">
        <div className="mx-auto max-w-prose rounded-2xl border border-success/40 bg-success/10 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-success">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </span>
          <h2 id="aanvraag-title" className="mt-5 text-2xl font-bold text-text-strong">
            Bedankt, uw aanvraag is ontvangen
          </h2>
          <p className="mt-3 text-text-body">
            Dit is een <strong>demo-bevestiging</strong> van de preview. Er is nog
            geen aanvraag verzonden en er zijn geen foto's geüpload. Neem voor een
            echte aanvraag telefonisch contact op via{" "}
            <a href={business.phone.href} className="font-semibold text-orange hover:underline">
              {business.phone.display}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setFiles([]); setErrors({}); setSubmitted(false); }}
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-text-strong hover:border-orange hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Nieuw formulier
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section id="aanvraag" aria-labelledby="aanvraag-title" className="bg-surface-muted/30">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
        <div className="max-w-prose">
          <p className="eyebrow">
            <span className="accent-rule" aria-hidden />
            Schade melden
          </p>
          <h2 id="aanvraag-title" className="mt-4 text-3xl font-bold sm:text-4xl">
            Laat uw schade beoordelen
          </h2>
          <p className="mt-4 text-text-body">
            Vul het formulier in, dan nemen we contact met u op om de schade en de
            mogelijkheden te bespreken. Foto's helpen ons om sneller een eerste
            beeld te vormen.
          </p>
          <p className="mt-6 flex items-start gap-2 rounded-lg border border-line bg-surface p-4 text-sm text-text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange" aria-hidden />
            Dit is een previewformulier. Ingevoerde gegevens en geselecteerde
            foto's worden nog niet daadwerkelijk verzonden.
          </p>
        </div>

        <form noValidate onSubmit={onSubmit} className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="naam" className="text-sm font-medium text-text-strong">
                Naam <span className="text-orange">*</span>
              </label>
              <input
                id="naam" name="naam" type="text" autoComplete="name"
                value={form.naam} onChange={(e) => set("naam", e.target.value)}
                className={`${inputBase} ${errors.naam ? "border-error" : "border-line"}`}
                {...aria("naam")}
              />
              {err("naam")}
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="telefoon" className="text-sm font-medium text-text-strong">
                Telefoonnummer <span className="text-orange">*</span>
              </label>
              <input
                id="telefoon" name="telefoon" type="tel" autoComplete="tel" inputMode="tel"
                value={form.telefoon} onChange={(e) => set("telefoon", e.target.value)}
                className={`${inputBase} ${errors.telefoon ? "border-error" : "border-line"}`}
                {...aria("telefoon")}
              />
              {err("telefoon")}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="text-sm font-medium text-text-strong">
                E-mailadres <span className="text-text-muted">(optioneel)</span>
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={(e) => set("email", e.target.value)}
                className={`${inputBase} ${errors.email ? "border-error" : "border-line"}`}
                {...aria("email")}
              />
              {err("email")}
            </div>

            {/* Klanttype */}
            <fieldset className="sm:col-span-2" aria-describedby={errors.klanttype ? "klanttype-error" : undefined}>
              <legend className="text-sm font-medium text-text-strong">
                U bent <span className="text-orange">*</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-3">
                {(["particulier", "zakelijk"] as Klanttype[]).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-muted/40 px-4 py-2.5 text-sm has-[:checked]:border-orange has-[:checked]:text-orange">
                    <input
                      id={`klanttype-${opt}`} type="radio" name="klanttype" value={opt}
                      checked={form.klanttype === opt}
                      onChange={() => set("klanttype", opt)}
                      className="accent-orange"
                    />
                    <span className="capitalize">{opt}</span>
                  </label>
                ))}
              </div>
              {err("klanttype")}
            </fieldset>

            {/* Voertuig */}
            <div className="sm:col-span-1">
              <label htmlFor="voertuig" className="text-sm font-medium text-text-strong">
                Type voertuig <span className="text-orange">*</span>
              </label>
              <select
                id="voertuig" name="voertuig"
                value={form.voertuig} onChange={(e) => set("voertuig", e.target.value as Voertuig)}
                className={`${inputBase} ${errors.voertuig ? "border-error" : "border-line"}`}
                {...aria("voertuig")}
              >
                <option value="">Maak een keuze…</option>
                <option value="auto">Auto</option>
                <option value="motor">Motor</option>
                <option value="scooter">Scooter</option>
                <option value="boot">Boot</option>
                <option value="anders">Anders</option>
              </select>
              {err("voertuig")}
            </div>

            {/* Verzekering */}
            <fieldset className="sm:col-span-1" aria-describedby={errors.verzekering ? "verzekering-error" : undefined}>
              <legend className="text-sm font-medium text-text-strong">
                Verzekeringsschade? <span className="text-orange">*</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["ja", "nee", "onbekend"] as Verzekering[]).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-muted/40 px-3.5 py-2.5 text-sm has-[:checked]:border-orange has-[:checked]:text-orange">
                    <input
                      id={`verzekering-${opt}`} type="radio" name="verzekering" value={opt}
                      checked={form.verzekering === opt}
                      onChange={() => set("verzekering", opt)}
                      className="accent-orange"
                    />
                    <span className="capitalize">{opt}</span>
                  </label>
                ))}
              </div>
              {err("verzekering")}
            </fieldset>

            {/* Omschrijving */}
            <div className="sm:col-span-2">
              <label htmlFor="omschrijving" className="text-sm font-medium text-text-strong">
                Omschrijving van de schade <span className="text-orange">*</span>
              </label>
              <textarea
                id="omschrijving" name="omschrijving" rows={4}
                value={form.omschrijving} onChange={(e) => set("omschrijving", e.target.value)}
                className={`${inputBase} resize-y ${errors.omschrijving ? "border-error" : "border-line"}`}
                placeholder="Wat is er gebeurd en waar zit de schade?"
                {...aria("omschrijving")}
              />
              {err("omschrijving")}
            </div>

            {/* Foto selectie (lokaal, niet verzonden) */}
            <div className="sm:col-span-2">
              <span className="text-sm font-medium text-text-strong">
                Foto's van de schade <span className="text-text-muted">(optioneel)</span>
              </span>
              <label
                htmlFor="fotos"
                className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface-muted/30 px-4 py-4 text-sm text-text-muted hover:border-orange hover:text-text-body"
              >
                <Upload className="h-4 w-4" aria-hidden />
                Foto's selecteren
                <input
                  id="fotos" name="fotos" type="file" accept="image/*" multiple className="sr-only"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
                />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-text-muted">
                  {files.map((name) => (
                    <li key={name} className="truncate">• {name}</li>
                  ))}
                </ul>
              )}
              <p className="mt-1.5 text-xs text-text-muted">
                In deze preview worden foto's niet verzonden; alleen de bestandsnamen
                worden lokaal getoond.
              </p>
            </div>

            {/* Privacy */}
            <div className="sm:col-span-2">
              <label htmlFor="privacy" className="flex items-start gap-3 text-sm text-text-body">
                <input
                  id="privacy" name="privacy" type="checkbox"
                  checked={form.privacy} onChange={(e) => set("privacy", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-orange"
                  {...aria("privacy")}
                />
                <span>
                  Ik ga akkoord dat mijn gegevens worden gebruikt om contact met mij
                  op te nemen over deze aanvraag. <span className="text-orange">*</span>
                </span>
              </label>
              {err("privacy")}
            </div>
          </div>

          <button
            type="submit"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-orange-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto"
          >
            Schade laten beoordelen
          </button>
        </form>
      </div>
    </Section>
  );
}
