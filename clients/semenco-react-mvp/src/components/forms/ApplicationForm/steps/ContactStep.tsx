import { contactMethodOptions } from "../applicationFormConfig";
import { RadioGroupField } from "@/components/forms/fields/RadioGroupField";
import { TextField } from "@/components/forms/fields/TextField";

/** Step 3 — contact details (how we reach the applicant). */
export function ContactStep() {
  return (
    <div className="space-y-5">
      <TextField name="fullName" label="Volledige naam" required autoComplete="name" />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="email"
          label="E-mailadres"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
        />
        <TextField
          name="phone"
          label="Telefoonnummer"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
        />
      </div>
      <RadioGroupField
        name="contactMethod"
        legend="Hoe nemen we het liefst contact op?"
        options={contactMethodOptions}
        required
      />
      <TextField
        name="contactTime"
        label="Beste moment om contact op te nemen (optioneel)"
        description="Bijvoorbeeld doordeweeks in de ochtend. Nog geen vaste afspraak."
      />
    </div>
  );
}
