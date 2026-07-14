import { processSteps } from "@/data/processSteps";
import { cn } from "@/utils/cn";

interface ProcessTimelineProps {
  /** Compact = numbered cards grid (home). Full = vertical timeline (werkwijze). */
  compact?: boolean;
}

/** Visual representation of the verified registration/intake steps. */
export function ProcessTimeline({ compact = false }: ProcessTimelineProps) {
  if (compact) {
    return (
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {processSteps.map((step) => (
          <li
            key={step.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
              {step.order}
            </span>
            <h3 className="mt-3 text-base font-semibold text-text-primary">{step.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-8">
      {processSteps.map((step) => (
        <li key={step.id} className="relative">
          <span
            className={cn(
              "absolute -left-[2.55rem] flex h-9 w-9 items-center justify-center rounded-full",
              "border-4 border-background bg-brand text-sm font-semibold text-white",
            )}
            aria-hidden="true"
          >
            {step.order}
          </span>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-text-primary">
              <span className="sr-only">Stap {step.order}: </span>
              {step.title}
            </h3>
            <p className="mt-1 text-text-secondary">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
