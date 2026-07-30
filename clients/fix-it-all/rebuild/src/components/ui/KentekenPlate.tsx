import { cn } from "@/utils/cn";

interface KentekenPlateProps {
  /** Rauwe kentekenwaarde, bijv. "78RZR1" of "78-RZR-1". */
  value: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeText = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl sm:text-3xl",
};

/**
 * Signature-element: de Nederlandse kenteken-plaat.
 * Terugkerend, functioneel merkteken (RDW-check + occasions). Geel leeft ALLEEN hier.
 */
export function KentekenPlate({ value, size = "md", className }: KentekenPlateProps) {
  const display = value.trim().toUpperCase();
  return (
    <span className={cn("kenteken shadow-plate", className)} role="img" aria-label={`Kenteken ${display}`}>
      <span className="kenteken__band" aria-hidden />
      <span className={cn("kenteken__value tracking-[0.12em]", sizeText[size])}>{display}</span>
    </span>
  );
}
