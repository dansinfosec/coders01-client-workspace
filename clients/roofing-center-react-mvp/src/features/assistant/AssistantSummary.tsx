import { Pencil, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AssistantAnswers, UploadMeta } from "./assistantTypes";
import { flowSteps, choiceLabel, issueLabels } from "./assistantFlow";
import { assistantConfig } from "./assistantConfig";

interface AssistantSummaryProps {
  issue: string;
  answers: AssistantAnswers;
  uploads: UploadMeta[];
  submitting: boolean;
  onEdit: (stepIndex: number) => void;
  onConfirm: () => void;
}

/** Review screen: grouped answers, per-item edit, submit. */
export function AssistantSummary({ issue, answers, uploads, submitting, onEdit, onConfirm }: AssistantSummaryProps) {
  const display = (id: string): string => {
    const step = flowSteps.find((s) => s.id === id);
    if (!step) return "—";
    const v = answers[id] ?? "";
    if (id === "photos") return uploads.length > 0 ? `${uploads.length} foto('s)` : "Geen";
    if (id === "consent") return v === "true" ? "Ja" : "Nee";
    if (step.kind === "options") return v ? choiceLabel(step, v) : "—";
    return v.trim() ? v : (step.optional ? "—" : "—");
  };

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-xs text-text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-green-strong" aria-hidden="true" />
        {assistantConfig.assessmentNote}
      </p>

      <div className="rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Onderwerp</span>
        </div>
        <p className="mt-0.5 text-sm text-text-strong">{issueLabels[issue] ?? issue}</p>
      </div>

      <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-text-muted">{step.summaryLabel}</dt>
              <dd className="truncate text-sm text-text-strong">{display(step.id)}</dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(index)}
              className="inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium text-green-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Wijzig
            </button>
          </div>
        ))}
      </dl>

      <Button type="button" className="w-full" onClick={onConfirm} disabled={submitting}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {submitting ? "Versturen…" : "Aanvraag versturen"}
      </Button>
    </div>
  );
}
