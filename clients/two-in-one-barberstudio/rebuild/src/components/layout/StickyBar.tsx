import { Phone, Navigation, CalendarCheck } from "lucide-react";
import { business, directionsUrl } from "@/data/business";

/**
 * Mobile sticky action bar: Bellen · Route · Boek afspraak.
 * z-40 keeps it above content but below the mobile menu (z-[60]/[70]).
 */
export function StickyBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto grid max-w-content grid-cols-3">
        <a
          href={business.phone.href}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-text-body hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Phone className="h-5 w-5 text-cream" aria-hidden="true" />
          Bellen
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 border-x border-line text-xs font-semibold text-text-body hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Navigation className="h-5 w-5 text-cream" aria-hidden="true" />
          Route
        </a>
        <a
          href={business.booking.base}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 bg-cream text-xs font-semibold text-ink hover:bg-cream-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          Boek afspraak
        </a>
      </div>
    </div>
  );
}
