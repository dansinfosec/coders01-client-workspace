import { Car, ImageOff } from "lucide-react";
import { KentekenPlate } from "@/components/ui/KentekenPlate";
import type { Occasion } from "@/data/occasions";
import { cn } from "@/utils/cn";

interface OccasionMediaProps {
  occasion: Occasion;
  /** Toon de kentekenplaat in de placeholder (uit op kleine kaarten). */
  showPlate?: boolean;
  className?: string;
  /** Object-fit hoogte-utility; standaard vult het de ouder. */
  imgClassName?: string;
}

/**
 * Occasion-beeld met nette, merkgebonden fallback wanneer er (nog) geen echte klantfoto is.
 * BEWUST GEEN stockfoto: we tonen een technische "blueprint"-placeholder met auto-silhouet en de
 * kentekenplaat (het signature-element), plus een eerlijke melding dat foto's volgen.
 */
export function OccasionMedia({ occasion, showPlate = true, className, imgClassName }: OccasionMediaProps) {
  const photo = occasion.photos[0];

  if (photo) {
    return (
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-cover", imgClassName, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-asphalt text-paper",
        className,
      )}
      role="img"
      aria-label={`${occasion.title} — foto volgt`}
    >
      <div className="blueprint pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <Car className="relative h-14 w-14 text-petrol-soft/80" aria-hidden />
      {showPlate && <KentekenPlate value={occasion.kenteken} size="sm" className="relative" />}
      <span className="relative inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-paper/55">
        <ImageOff className="h-3.5 w-3.5" aria-hidden />
        Foto volgt
      </span>
    </div>
  );
}
