import { useState } from "react";
import { OccasionMedia } from "@/components/occasions/OccasionMedia";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Occasion } from "@/data/occasions";
import { cn } from "@/utils/cn";

interface OccasionGalleryProps {
  occasion: Occasion;
}

/**
 * Occasion-galerij: grote hoofdfoto + thumbnailrail. Zonder echte foto's toont het een nette
 * merkgebonden placeholder (geen stockbeeld) met een eerlijke melding dat foto's volgen.
 */
export function OccasionGallery({ occasion }: OccasionGalleryProps) {
  const [active, setActive] = useState(0);
  const photos = occasion.photos;

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-asphalt">
        {photos.length > 0 ? (
          <img
            src={photos[active]!.src}
            alt={photos[active]!.alt}
            className="h-full w-full object-cover"
            decoding="async"
          />
        ) : (
          <OccasionMedia occasion={occasion} />
        )}
        <div className="absolute left-3 top-3">
          <StatusPill status={occasion.status} solid />
        </div>
      </div>

      {photos.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1} tonen`}
              aria-current={i === active}
              className={cn(
                "aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
                i === active ? "border-petrol" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={p.src} alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
