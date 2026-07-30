import { cn } from "@/utils/cn";
import {
  occasionStatusLabels,
  occasionStatusStyle,
  type OccasionStatus,
} from "@/data/occasionStatus";

interface StatusPillProps {
  status: OccasionStatus;
  className?: string;
  /** Compacte variant (op fotokaarten). */
  solid?: boolean;
}

export function StatusPill({ status, className, solid }: StatusPillProps) {
  const style = occasionStatusStyle[status];
  const label = occasionStatusLabels[status];

  if (solid) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-asphalt-900/85 px-2.5 py-1 font-mono text-2xs font-semibold uppercase tracking-label text-white backdrop-blur",
          className,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 font-mono text-2xs font-semibold uppercase tracking-label ring-1",
        style.text,
        style.ring,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
      {label}
    </span>
  );
}
