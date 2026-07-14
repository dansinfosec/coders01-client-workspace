import { RadioGroupField } from "@/components/forms/fields/RadioGroupField";
import { fundingOptions, urgencyOptions, yesNoUnknownOptions } from "../applicationFormConfig";

/** Step 6 — current care & referral situation (neutral funding wording). */
export function CareDetailsStep() {
  return (
    <div className="space-y-6">
      <RadioGroupField
        name="currentSupport"
        legend="Is er op dit moment professionele ondersteuning betrokken?"
        options={yesNoUnknownOptions}
        required
      />
      <RadioGroupField
        name="hasReferrer"
        legend="Is er een verwijzer of casemanager betrokken?"
        options={yesNoUnknownOptions}
        required
      />
      <RadioGroupField
        name="funding"
        legend="Is er al financiering of een indicatie geregeld?"
        options={fundingOptions}
        required
      />
      <RadioGroupField
        name="requestUrgency"
        legend="Is de aanvraag oriënterend of speelt het op korte termijn?"
        options={urgencyOptions}
        required
      />
    </div>
  );
}
