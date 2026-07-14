import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { useApplicationSteps } from "./ApplicationFormProvider";

/**
 * Progress indicator. Mobile: step number + title + bar (not overwhelming).
 * Desktop (sm+): a compact step list. Step changes are announced via aria-live.
 */
export function ApplicationProgress() {
  const { steps, currentIndex } = useApplicationSteps();
  const total = steps.length;
  const current = steps[currentIndex];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary" aria-live="polite">
          Stap {currentIndex + 1} van {total}: {current?.title}
        </p>
        <p className="text-xs text-text-secondary" aria-hidden="true">
          {Math.round(((currentIndex + 1) / total) * 100)}%
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Compact step list — desktop only, decorative. */}
      <ol className="mt-3 hidden flex-wrap gap-1.5 sm:flex" aria-hidden="true">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                active && "bg-brand text-white",
                done && "bg-brand-soft text-brand-strong",
                !active && !done && "bg-surface-muted text-text-secondary",
              )}
            >
              <span className="flex h-4 w-4 items-center justify-center text-[10px]">
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {step.title}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
