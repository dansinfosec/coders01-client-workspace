import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { OccasionMedia } from "@/components/occasions/OccasionMedia";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Occasion } from "@/data/occasions";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/utils/cn";

interface OccasionGalleryProps {
  occasion: Occasion;
}

/**
 * Occasion-galerij: grote hoofdfoto met vorige/volgende, teller "3 / 12", thumbnailstrip en
 * fullscreen-lightbox (scroll-lock, Escape, pijltjestoetsen). Zonder foto's toont het een nette
 * merkgebonden placeholder (geen stockbeeld).
 */
export function OccasionGallery({ occasion }: OccasionGalleryProps) {
  const photos = occasion.photos;
  const count = photos.length;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useLockBodyScroll(lightbox);

  const go = useCallback(
    (dir: 1 | -1) => setActive((i) => (count === 0 ? 0 : (i + dir + count) % count)),
    [count],
  );

  // Pijltjestoetsen (lightbox open) + Escape.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  if (count === 0) {
    return (
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line">
        <OccasionMedia occasion={occasion} />
      </div>
    );
  }

  const activePhoto = photos[Math.min(active, count - 1)]!;

  return (
    <div>
      {/* Hoofdfoto */}
      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-asphalt">
        <img
          src={activePhoto.src}
          alt={activePhoto.alt}
          className="h-full w-full object-cover"
          decoding="async"
        />

        <div className="absolute left-3 top-3">
          <StatusPill status={occasion.status} solid />
        </div>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Foto vergroten"
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-asphalt-900/70 text-white backdrop-blur transition-colors hover:bg-asphalt-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
        >
          <Maximize2 className="h-4 w-4" aria-hidden />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Vorige foto"
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-asphalt-900/70 text-white opacity-0 backdrop-blur transition-all hover:bg-asphalt-900 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Volgende foto"
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-asphalt-900/70 text-white opacity-0 backdrop-blur transition-all hover:bg-asphalt-900 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-asphalt-900/80 px-2.5 py-1 font-mono text-2xs font-semibold text-white backdrop-blur">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnailstrip */}
      {count > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1} tonen`}
              aria-current={i === active}
              className={cn(
                "aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol sm:w-24",
                i === active ? "border-petrol" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={p.src} alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${occasion.title} — foto ${active + 1} van ${count}`}
          className="fixed inset-0 z-[90] flex flex-col bg-asphalt-900/95 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="font-mono text-2xs uppercase tracking-label text-paper/70">
              {active + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Sluiten"
              autoFocus
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
            <img
              src={activePhoto.src}
              alt={activePhoto.alt}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
              decoding="async"
            />
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Vorige foto"
                className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Volgende foto"
                className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
