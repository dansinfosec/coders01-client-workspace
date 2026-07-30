import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

/** Top progress indicator for the multi-step appointment flow. */
export function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-mono text-sm font-bold transition-colors",
                done && "border-mark bg-mark text-white",
                active && "border-mark bg-surface text-mark",
                !done && !active && "border-line bg-surface text-text-muted",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-semibold sm:inline",
                active ? "text-text-strong" : "text-text-muted",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className={cn("h-px flex-1", done ? "bg-mark" : "bg-line")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
