import { cn } from "@/utils/cn";

/**
 * Temporary text-based wordmark for "Two in one barberstudio".
 * The owner's logo artwork is only available as a phone screenshot, so a clean
 * serif wordmark is used for the preview.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#top"
      aria-label="Two in one barberstudio — naar boven"
      className={cn(
        "group inline-flex flex-col leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded",
        className,
      )}
    >
      <span className="font-serif text-base font-bold tracking-tight text-cream sm:text-lg">
        Two in one <span className="text-red">barberstudio</span>
      </span>
      <span className="mt-0.5 flex items-center gap-1.5">
        <span className="h-px w-4 bg-red" aria-hidden="true" />
        <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted">
          Barbershop · Rijswijk
        </span>
      </span>
    </a>
  );
}
