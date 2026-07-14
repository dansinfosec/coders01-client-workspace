import { ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApplicationSteps } from "./ApplicationFormProvider";
import { applicationFormContent } from "@/data/applicationFormContent";

interface ApplicationIntroProps {
  onStart: () => void;
}

/** Entry screen shown before step 1: what the form is for + expectations. */
export function ApplicationIntro({ onStart }: ApplicationIntroProps) {
  const { hadDraft } = useApplicationSteps();
  const { intro } = applicationFormContent;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
      <h2 className="text-2xl font-semibold text-text-primary">{intro.title}</h2>
      <p className="mt-3 max-w-prose text-text-secondary">{intro.lead}</p>

      <ul className="mt-6 space-y-2.5">
        {intro.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-text-primary">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {hadDraft && (
        <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted p-3 text-sm text-text-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <span>Je hebt een eerder concept. Je gaat verder waar je gebleven was.</span>
        </p>
      )}

      <div className="mt-7">
        <Button type="button" size="lg" onClick={onStart}>
          {hadDraft ? "Verder met de aanvraag" : intro.startLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
