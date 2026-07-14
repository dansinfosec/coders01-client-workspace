import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../applicationFormSchema";
import { applicantTypeOptions } from "../applicationFormConfig";
import { RadioCardsField } from "@/components/forms/fields/RadioCardsField";
import { TextField } from "@/components/forms/fields/TextField";

/** Step 2 — who is filling in the form, with conditional role-specific fields. */
export function ApplicantStep() {
  const { watch } = useFormContext<ApplicationFormValues>();
  const applicantType = watch("applicantType");

  return (
    <div className="space-y-5">
      <RadioCardsField
        name="applicantType"
        legend="Wie vult dit formulier in?"
        items={applicantTypeOptions.map((o) => ({
          value: o.id,
          label: o.label,
          description: o.description,
          icon: o.icon,
        }))}
        required
      />

      {applicantType === "parent" && (
        <TextField
          name="applicantRelation"
          label="Relatie tot het kind"
          description="Bijvoorbeeld ouder, verzorger of pleegouder."
          required
        />
      )}

      {applicantType === "professional" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="organisation" label="Organisatie" required />
          <TextField name="role" label="Functie of rol" required />
        </div>
      )}
    </div>
  );
}
