import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

/**
 * BM Carservice wordmark. A crisp, scalable signage lockup (red "BM" plate + wordmark)
 * instead of the low-res site JPEG. TODO: swap for a vector logo when the client provides one.
 */
export function Logo({
  invert = false,
  withTagline = true,
  className,
}: {
  invert?: boolean;
  withTagline?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/"
      aria-label="BM Carservice — naar de homepage"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center bg-mark font-display text-base font-extrabold leading-none text-white shadow-sm"
      >
        BM
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-extrabold uppercase tracking-tight",
            invert ? "text-text-invert" : "text-text-strong",
          )}
        >
          Carservice
        </span>
        {withTagline && (
          <span
            className={cn(
              "mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.16em]",
              invert ? "text-text-invert/70" : "text-text-muted",
            )}
          >
            Uw veiligheid is ons beroep
          </span>
        )}
      </span>
    </Link>
  );
}
