import { cn } from "@/utils/cn";

/**
 * Temporary text-based wordmark for "Gentleman's Touch".
 * NOT a final logo — the owner's real logo artwork is a phone screenshot with
 * conflicting names, so a clean serif wordmark is used for the preview.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#top"
      aria-label="Gentleman's Touch — naar boven"
      className={cn(
        "group inline-flex flex-col leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded",
        className,
      )}
    >
      <span className="font-serif text-lg font-bold tracking-tight text-cream sm:text-xl">
        Gentleman&rsquo;s Touch
      </span>
      <span className="mt-0.5 flex items-center gap-1.5">
        <span className="h-px w-4 bg-red" aria-hidden="true" />
        <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-text-muted">
          Luxury Men&rsquo;s Grooming
        </span>
      </span>
    </a>
  );
}
