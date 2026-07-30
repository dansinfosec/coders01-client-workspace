import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TagProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

/** Mono-label ("readout"-stijl) voor specs, categorieën en meta. */
export function Tag({ children, className, icon }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-2xs uppercase tracking-label text-text-muted",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
