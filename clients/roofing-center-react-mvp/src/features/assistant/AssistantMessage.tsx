import type { ReactNode } from "react";
import { HardHat } from "lucide-react";

interface AssistantMessageProps {
  from: "assistant" | "user" | "note";
  children: ReactNode;
}

/** A single chat bubble. `note` = a calm system note (e.g. leak advice). */
export function AssistantMessage({ from, children }: AssistantMessageProps) {
  if (from === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-green px-3.5 py-2 text-sm font-medium text-navy">
          {children}
        </div>
      </div>
    );
  }
  if (from === "note") {
    return (
      <div className="rounded-xl border border-cream/70 bg-cream-soft px-3.5 py-2.5 text-sm text-navy-800">
        {children}
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <span aria-hidden="true" className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-green">
        <HardHat className="h-4 w-4" />
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-muted px-3.5 py-2 text-sm text-text-body">
        {children}
      </div>
    </div>
  );
}
