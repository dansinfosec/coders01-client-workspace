import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { getOpenStatus, type OpenStatus } from "@/lib/openingHours";

/**
 * Live "geopend / gesloten" status pill — leads with BM's walk-in advantage.
 * Computes on mount (client-side clock) and refreshes each minute.
 */
export function StatusPill({ className, onInk = false }: { className?: string; onInk?: boolean }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Render nothing until mounted to avoid a server/client flash (SPA: first paint).
  if (!status) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs font-medium",
        onInk ? "text-text-invert/90" : "text-text-body",
        className,
      )}
      role="status"
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 rounded-full",
          status.isOpen ? "bg-pass" : "bg-mark",
          status.isOpen && "shadow-[0_0_0_3px_hsl(var(--pass)/0.25)]",
        )}
      />
      {status.label}
    </span>
  );
}
