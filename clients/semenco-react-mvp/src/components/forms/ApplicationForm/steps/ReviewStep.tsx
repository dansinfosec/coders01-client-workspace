import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { Info } from "lucide-react";
import type { ApplicationFormValues } from "../applicationFormSchema";
import { ApplicationSummary } from "../ApplicationSummary";
import { errorClass } from "@/components/forms/fields/fieldStyles";
import { applicationFormContent } from "@/data/applicationFormContent";

interface ConsentRowProps {
  name: "consentPrivacy" | "consentAccurate";
  label: string;
}

function ConsentRow({ name, label }: ConsentRowProps) {
  const { register, formState } = useFormContext<ApplicationFormValues>();
  const id = useId();
  const errId = `${id}-err`;
  const error = formState.errors[name];
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-1 h-4 w-4 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          {...register(name)}
        />
        <span className="text-sm text-text-primary">{label}</span>
      </label>
      {error && (
        <p id={errId} role="alert" className={`mt-1 ${errorClass}`}>
          {String(error.message)}
        </p>
      )}
    </div>
  );
}

/** Step 8 — review all answers and give consent before submitting. */
export function ReviewStep() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Controleer je gegevens. Klopt alles? Geef dan toestemming en verstuur de aanvraag.
      </p>

      <ApplicationSummary />

      <p className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4 text-sm text-text-secondary">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
        <span>
          {applicationFormContent.submissionNote} {applicationFormContent.privacyStatementNote}
        </span>
      </p>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <ConsentRow name="consentPrivacy" label={applicationFormContent.privacyConsentLabel} />
        <ConsentRow name="consentAccurate" label={applicationFormContent.accuracyConsentLabel} />
      </div>
    </div>
  );
}
