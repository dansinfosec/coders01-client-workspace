import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type TagTone = "signal" | "ink" | "outline" | "onInk";

const tones: Record<TagTone, string> = {
  signal: "bg-signal text-ink",
  ink: "bg-ink text-text-invert",
  outline: "border border-ink/20 text-text-muted",
  onInk: "bg-ink-800 text-signal",
};

/**
 * Mono signage label — the "WERKPLAATS / RECEPTIE" reception-board language.
 * A small uppercase monospace chip; used for eyebrows, service tags and status.
 */
export function Tag({
  children,
  tone = "signal",
  className,
}: {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
