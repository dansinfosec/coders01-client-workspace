import { ShieldAlert } from "lucide-react";
import { RadioCardsField } from "@/components/forms/fields/RadioCardsField";
import { requestTypeOptions } from "../applicationFormConfig";
import { applicationFormContent } from "@/data/applicationFormContent";

/** Step 1 — type of request (large selectable cards) + calm crisis notice. */
export function RequestTypeStep() {
  return (
    <div className="space-y-5">
      <RadioCardsField
        name="requestType"
        legend="Kies het type aanvraag"
        items={requestTypeOptions.map((o) => ({
          value: o.id,
          label: o.label,
          description: o.description,
          icon: o.icon,
        }))}
        required
      />
      <p className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-4 text-sm text-text-secondary">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
        <span>{applicationFormContent.crisisNotice}</span>
      </p>
    </div>
  );
}
