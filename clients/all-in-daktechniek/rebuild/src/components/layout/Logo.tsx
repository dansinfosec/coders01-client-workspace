import { Link } from "react-router-dom";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/utils/cn";

interface LogoProps {
  /** "invert" for dark backgrounds (header/footer), "ink" for light. */
  tone?: "invert" | "ink";
  className?: string;
}

/**
 * Text wordmark. The current logo asset is only 259×77 px (black on transparent)
 * and would be invisible on the dark header, so we render a clean wordmark until
 * Borre supplies a hi-res / vector logo. See docs/NEXT-ACTIONS.md.
 */
export function Logo({ tone = "invert", className }: LogoProps) {
  return (
    <Link
      to={ROUTES.home}
      aria-label={`${company.name} — naar de homepage`}
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded font-extrabold tracking-tight",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
        tone === "invert" ? "text-text-invert focus-visible:ring-offset-ink" : "text-text-strong",
        className,
      )}
    >
      <span className="text-lg sm:text-xl">All-in</span>
      <span className="text-lg text-green sm:text-xl">Daktechniek</span>
    </Link>
  );
}
