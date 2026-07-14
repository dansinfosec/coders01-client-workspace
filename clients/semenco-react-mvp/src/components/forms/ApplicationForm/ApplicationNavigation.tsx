import { ArrowLeft, ArrowRight, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApplicationSteps } from "./ApplicationFormProvider";
import { applicationFormContent } from "@/data/applicationFormContent";

interface ApplicationNavigationProps {
  submitting: boolean;
}

/** Previous / Next / Submit + a confirm-guarded "Wis formulier" (clear draft). */
export function ApplicationNavigation({ submitting }: ApplicationNavigationProps) {
  const { isFirst, isLast, goNext, goPrev, clearDraft } = useApplicationSteps();

  const handleClear = () => {
    if (window.confirm(applicationFormContent.clearDraftConfirm)) {
      clearDraft();
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={goPrev}
          disabled={isFirst}
          className={isFirst ? "invisible" : undefined}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Vorige
        </Button>

        {isLast ? (
          <Button type="submit" disabled={submitting}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {submitting ? "Versturen…" : "Aanvraag versturen"}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Volgende
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="mt-4 text-right">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-text-secondary hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Wis formulier
        </button>
      </div>
    </div>
  );
}
