import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { imageSources } from "@/lib/images";
import { cn } from "@/utils/cn";
import { projectCategories, type Project, type ProjectCategory } from "@/data/projects";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface ProjectGalleryProps {
  items: Project[];
  showFilters?: boolean;
}

/** Masonry project grid with an accessible lightbox (arrow keys, Escape, focus trap). */
export function ProjectGallery({ items, showFilters = true }: ProjectGalleryProps) {
  const [filter, setFilter] = useState<ProjectCategory | "alle">("alle");
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(
    () => (filter === "alle" ? items : items.filter((p) => p.category === filter)),
    [items, filter],
  );

  useLockBodyScroll(index !== null);

  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + filtered.length) % filtered.length)), [filtered.length]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % filtered.length)), [filtered.length]);

  useEffect(() => {
    if (index === null) return;
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "Tab") { e.preventDefault(); dialogRef.current?.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, close, prev, next]);

  const current = index !== null ? filtered[index] : undefined;

  return (
    <div>
      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter projecten">
          {projectCategories.map((c) => {
            const active = filter === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setFilter(c.value)}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  active ? "bg-navy text-text-invert" : "border border-line bg-surface text-text-body hover:bg-surface-muted",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {filtered.map((p, i) => (
          <li key={p.id} className="break-inside-avoid">
            <button
              type="button"
              onClick={(e) => { triggerRef.current = e.currentTarget; setIndex(i); }}
              className="group block w-full overflow-hidden rounded-2xl border border-line bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              aria-label={`Bekijk: ${p.caption}`}
            >
              <Img base={p.base} alt={p.alt} width={p.w} height={p.h}
                className="w-full transition-transform duration-300 group-hover:scale-[1.03]" sizes="(min-width:1024px) 24rem, (min-width:640px) 45vw, 90vw" />
              <span className="block px-3 py-2.5 text-left text-sm font-medium text-text-body">{p.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-900/90 p-4" onClick={close}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={current.caption}
            tabIndex={-1}
            className="relative max-h-[90dvh] w-full max-w-4xl focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <picture>
              <source type="image/webp" srcSet={imageSources(current.base).webp} />
              <img
                src={imageSources(current.base).jpg}
                alt={current.alt}
                width={current.w}
                height={current.h}
                className="mx-auto max-h-[78dvh] w-auto rounded-xl object-contain"
              />
            </picture>
            <p className="mt-3 text-center text-sm text-text-invert/90">
              {current.caption} <span className="text-text-invert/50">· {index! + 1} / {filtered.length}</span>
            </p>

            <button type="button" onClick={close} aria-label="Sluiten"
              className="absolute -top-2 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-text-invert hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:-right-2">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {filtered.length > 1 && (
              <>
                <button type="button" onClick={prev} aria-label="Vorige foto"
                  className="absolute left-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy-800/90 text-text-invert hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:-left-14">
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button type="button" onClick={next} aria-label="Volgende foto"
                  className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy-800/90 text-text-invert hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:-right-14">
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
