import { forwardRef } from "react";
import { formatKenteken, normalizeKenteken } from "@/lib/kenteken";
import { cn } from "@/utils/cn";

interface KentekenInputProps {
  /** Genormaliseerde waarde (zonder streepjes). */
  value: string;
  /** Levert de genormaliseerde waarde terug. */
  onValueChange: (normalized: string) => void;
  id?: string;
  className?: string;
  size?: "md" | "lg";
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  autoFocus?: boolean;
}

const sizes = {
  md: "h-12 text-xl",
  lg: "h-14 text-2xl sm:h-16 sm:text-3xl",
};

/**
 * Kenteken-invoer in de vorm van een echte NL-plaat (signature-element).
 * Slaat genormaliseerd op, toont geformatteerd met streepjes.
 */
export const KentekenInput = forwardRef<HTMLInputElement, KentekenInputProps>(function KentekenInput(
  { value, onValueChange, id, className, size = "lg", autoFocus, ...aria },
  ref,
) {
  return (
    <div
      className={cn(
        "kenteken shadow-plate flex w-full max-w-xs items-stretch overflow-hidden",
        className,
      )}
    >
      <span className="kenteken__band shrink-0" aria-hidden />
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        value={formatKenteken(value)}
        onChange={(e) => onValueChange(normalizeKenteken(e.target.value))}
        placeholder="00-AA-00"
        className={cn(
          "w-full bg-transparent px-3 font-mono font-bold uppercase tracking-[0.15em] text-plate-ink placeholder:text-plate-ink/40 focus:outline-none",
          sizes[size],
        )}
        {...aria}
      />
    </div>
  );
});
