import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { gallery } from "@/data/gallery";
import { Section } from "@/components/ui/Section";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isOpen = openIndex !== null;
  useLockBodyScroll(isOpen);

  const close = useCallback(() => {
    const idx = openIndex;
    setOpenIndex(null);
    // Return focus to the thumbnail that opened the lightbox.
    window.setTimeout(() => {
      if (idx !== null) triggerRefs.current[idx]?.focus();
    }, 20);
  }, [openIndex]);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((cur) => {
        if (cur === null) return cur;
        return (cur + delta + gallery.length) % gallery.length;
      });
    },
    [],
  );

  // Keyboard: Escape closes, arrows navigate, Tab is trapped within the dialog.
  useEffect(() => {
    if (!isOpen) return;
    window.setTimeout(() => closeRef.current?.focus(), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  const current = openIndex !== null ? gallery[openIndex] : null;

  return (
    <Section id="werk" aria-labelledby="werk-title">
      <div className="max-w-prose">
        <p className="eyebrow">
          <span className="accent-rule" aria-hidden />
          Werk
        </p>
        <h2 id="werk-title" className="mt-4 text-3xl font-bold sm:text-4xl">
          Schadeherstel in beeld
        </h2>
        <p className="mt-4 text-text-body">
          Een indruk van het soort werk: van carrosserie- en plaatschade tot
          spuit- en lakwerk voor verschillende voertuigen.
        </p>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {gallery.map((img, i) => (
          <li
            key={img.src}
            className={img.span ? "col-span-2 lg:col-span-2" : "col-span-1"}
          >
            <button
              ref={(el) => { triggerRefs.current[i] = el; }}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block w-full overflow-hidden rounded-xl border border-line focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              aria-label={`Vergroot: ${img.caption}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                width={1200}
                height={805}
                loading="lazy"
                decoding="async"
                className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm font-medium text-white">
                {img.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-5 flex items-center gap-2 text-xs text-text-muted">
        <Sparkles className="h-4 w-4 text-orange" aria-hidden />
        Sfeerimpressie – AI-gegenereerde previewbeelden.
      </p>

      {/* Lightbox */}
      {isOpen && current && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/85" onClick={close} />
          <div className="relative z-10 w-full max-w-4xl">
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <img
                src={current.src}
                alt={current.alt}
                width={1200}
                height={805}
                className="max-h-[75vh] w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{current.caption}</p>
                <p className="mt-0.5 text-xs text-white/60">{current.attribution}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="rounded-lg border border-white/20 p-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  aria-label="Vorige afbeelding"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="rounded-lg border border-white/20 p-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  aria-label="Volgende afbeelding"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-white/20 p-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  aria-label="Sluiten"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
