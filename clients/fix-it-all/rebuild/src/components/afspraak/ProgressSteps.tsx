import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface ProgressStepsProps {
  steps: string[];
  /** 1-based huidige stap. */
  current: number;
  /** Ga naar een reeds voltooide stap. */
  onGoto?: (step: number) => void;
}

export function ProgressSteps({ steps, current, onGoto }: ProgressStepsProps) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Voortgang">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        const clickable = done && onGoto;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onGoto(n)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors sm:px-3",
                active && "border-petrol bg-petrol-soft",
                done && "border-line bg-surface hover:border-petrol/40",
                !active && !done && "border-line bg-surface-muted",
                clickable && "cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold",
                  active && "bg-petrol text-white",
                  done && "bg-petrol/15 text-petrol",
                  !active && !done && "bg-line text-text-muted",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : n}
              </span>
              <span
                className={cn(
                  "hidden truncate text-sm font-semibold sm:block",
                  active ? "text-petrol-strong" : done ? "text-text-body" : "text-text-muted",
                )}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
