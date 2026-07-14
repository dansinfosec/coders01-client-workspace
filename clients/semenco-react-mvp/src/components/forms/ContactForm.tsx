import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  descriptionClass,
  errorClass,
  inputClass,
  labelClass,
} from "@/components/forms/fields/fieldStyles";

// Frontend-only contact form schema. Kept minimal and non-sensitive.
const contactSchema = z.object({
  name: z.string().min(1, "Vul je naam in."),
  email: z.string().min(1, "Vul je e-mailadres in.").email("Vul een geldig e-mailadres in."),
  message: z.string().min(10, "Schrijf een kort bericht (minimaal 10 tekens)."),
  consent: z.boolean().refine((v) => v === true, {
    message: "Geef toestemming om contact op te nemen.",
  }),
});

type ContactValues = z.infer<typeof contactSchema>;

/** Accessible, frontend-only contact form with a calm confirmation state. */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", consent: false },
    mode: "onTouched",
  });
  const [sent, setSent] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const msgId = useId();
  const consentId = useId();

  const onSubmit = async (): Promise<void> => {
    // TODO: Replace demo submission with backend API integration.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-text-primary">Bedankt voor je bericht</h2>
        <p className="mx-auto mt-2 max-w-prose text-sm text-text-secondary">
          Dit is een demoformulier — er is nog geen echte verzending gekoppeld.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8"
    >
      <div className="space-y-1.5">
        <label htmlFor={nameId} className={labelClass}>
          Naam <span className="text-error">*</span>
        </label>
        <input
          id={nameId}
          className={inputClass}
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-err` : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id={`${nameId}-err`} role="alert" className={errorClass}>
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={emailId} className={labelClass}>
          E-mailadres <span className="text-error">*</span>
        </label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          className={inputClass}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-err` : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id={`${emailId}-err`} role="alert" className={errorClass}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={msgId} className={labelClass}>
          Bericht <span className="text-error">*</span>
        </label>
        <p id={`${msgId}-desc`} className={descriptionClass}>
          Vertel kort waar we je mee kunnen helpen. Deel geen gevoelige medische gegevens.
        </p>
        <textarea
          id={msgId}
          rows={5}
          className={inputClass}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={`${msgId}-desc${errors.message ? ` ${msgId}-err` : ""}`}
          {...register("message")}
        />
        {errors.message && (
          <p id={`${msgId}-err`} role="alert" className={errorClass}>
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface-muted p-4">
        <label htmlFor={consentId} className="flex items-start gap-3">
          <input
            id={consentId}
            type="checkbox"
            className="mt-1 h-4 w-4 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${consentId}-err` : undefined}
            {...register("consent")}
          />
          <span className="text-sm text-text-primary">
            Ik geef toestemming om mijn gegevens te gebruiken om contact met mij op te nemen.
          </span>
        </label>
        {errors.consent && (
          <p id={`${consentId}-err`} role="alert" className={`mt-2 ${errorClass}`}>
            {errors.consent.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Versturen…" : "Bericht versturen"}
      </Button>
    </form>
  );
}
