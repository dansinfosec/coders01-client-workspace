import { forwardRef } from "react";
import { formatKenteken, normalizeKenteken } from "@/lib/kenteken";
import { cn } from "@/utils/cn";

/** The blue EU/NL band shown on the left of every Dutch plate. */
function NlBand({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex flex-col items-center justify-center bg-[#0b3aa0] px-2 text-white select-none",
        className,
      )}
      aria-hidden="true"
    >
      <span className="text-[0.5em] leading-none text-signal">★★★</span>
      <span className="font-sans text-[0.62em] font-bold leading-tight tracking-wide">NL</span>
    </span>
  );
}

interface PlateInputProps {
  /** Normalised value (A–Z/0–9, no dashes). */
  value: string;
  onChange: (normalized: string) => void;
  onEnter?: () => void;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  disabled?: boolean;
}

/**
 * Editable licence-plate field styled like a real Dutch plate: blue NL band, yellow
 * background, black border, auto-uppercase, dashes formatted for display and stripped
 * from the stored value. Fully responsive.
 */
export const PlateInput = forwardRef<HTMLInputElement, PlateInputProps>(function PlateInput(
  { value, onChange, onEnter, id, disabled, ...aria },
  ref,
) {
  return (
    <div
      className={cn(
        "flex h-14 w-full max-w-xs items-stretch overflow-hidden rounded-lg border-[3px] border-black bg-signal font-mono text-2xl font-bold text-black shadow-sm sm:h-16 sm:text-3xl",
        disabled && "opacity-70",
      )}
    >
      <NlBand />
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        value={formatKenteken(value)}
        placeholder="XX-999-X"
        onChange={(e) => onChange(normalizeKenteken(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
        className="w-full min-w-0 bg-transparent px-3 text-center uppercase tracking-[0.15em] placeholder:text-black/35 focus:outline-none"
        aria-label="Kenteken"
        {...aria}
      />
    </div>
  );
});

/** Small, read-only plate badge for the overview card. */
export function PlateBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded border-2 border-black bg-signal font-mono text-sm font-bold leading-none text-black",
        className,
      )}
    >
      <NlBand className="px-1.5" />
      <span className="px-2 py-1.5 uppercase tracking-[0.12em]">{formatKenteken(value)}</span>
    </span>
  );
}
