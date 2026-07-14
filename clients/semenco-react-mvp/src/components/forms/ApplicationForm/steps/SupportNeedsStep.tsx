import { supportAreaOptions } from "../applicationFormConfig";
import { CheckboxCardsField } from "@/components/forms/fields/CheckboxCardsField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";

/** Step 5 — general support request: selectable cards + optional free text. */
export function SupportNeedsStep() {
  return (
    <div className="space-y-6">
      <CheckboxCardsField
        name="supportAreas"
        legend="Waar is ondersteuning bij nodig?"
        description="Kies wat past. Dit geeft ons een eerste, algemeen beeld — je kunt meerdere onderwerpen kiezen."
        options={supportAreaOptions}
        required
      />
      <TextAreaField
        name="supportImportant"
        label="Wat is voor ons belangrijk om vooraf te weten? (optioneel)"
        description="Kort en algemeen. Deel geen uitgebreide medische gegevens."
        rows={4}
      />
    </div>
  );
}
