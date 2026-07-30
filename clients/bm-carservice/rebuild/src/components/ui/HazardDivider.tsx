import { cn } from "@/utils/cn";

/**
 * Signature element — the safety-stripe (hazard) divider.
 * Yellow-on-anthracite diagonal band, straight from the workshop / garage-door language
 * and the brand promise "Uw veiligheid is ons beroep". Use sparingly (once or twice).
 */
export function HazardDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-3 w-full bg-hazard", className)}
    />
  );
}
