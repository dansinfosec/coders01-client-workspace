import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../applicationFormSchema";
import { wantIntroOptions } from "../applicationFormConfig";
import { RadioGroupField } from "@/components/forms/fields/RadioGroupField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { TextField } from "@/components/forms/fields/TextField";

/** Step 7 — preferences & practical info; extra field for crisis requests. */
export function PreferencesStep() {
  const { watch } = useFormContext<ApplicationFormValues>();
  const isCrisis = watch("requestType") === "crisis";

  return (
    <div className="space-y-5">
      <TextField
        name="preferredStart"
        label="Gewenste startperiode (optioneel)"
        description="Een globale periode is voldoende, bijvoorbeeld “na de zomer”."
      />
      <TextField
        name="relevantPeriods"
        label="Relevante dagen of periodes (optioneel)"
        description="Bijvoorbeeld bepaalde weekenden of vakantieperiodes."
      />
      <RadioGroupField
        name="wantIntroTalk"
        legend="Wil je eerst een vrijblijvend kennismakingsgesprek?"
        options={wantIntroOptions}
      />

      {isCrisis && (
        <TextAreaField
          name="crisisSituation"
          label="Korte beschrijving van de situatie (optioneel)"
          description="Kort en zakelijk. Deel geen zeer gevoelige of heftige details in dit formulier."
          rows={4}
        />
      )}

      <TextAreaField
        name="comments"
        label="Aanvullende opmerkingen (optioneel)"
        rows={4}
      />
    </div>
  );
}
