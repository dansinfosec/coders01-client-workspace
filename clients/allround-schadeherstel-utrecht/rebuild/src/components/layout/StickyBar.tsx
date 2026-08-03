import { Phone, Navigation, ClipboardCheck } from "lucide-react";
import { business, directionsUrl } from "@/data/business";

/**
 * Mobile sticky action bar — three distinct actions, no duplicates:
 *   Bellen (tel) · Route (Maps directions) · Schade melden (lead form).
 */
export function StickyBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-anthracite/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="grid grid-cols-3">
        <a
          href={business.phone.href}
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium text-text-strong hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        >
          <Phone className="h-5 w-5" aria-hidden />
          Bellen
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 border-x border-line py-2.5 text-xs font-medium text-text-strong hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        >
          <Navigation className="h-5 w-5" aria-hidden />
          Route
        </a>
        <a
          href="#aanvraag"
          className="flex flex-col items-center justify-center gap-1 bg-orange py-2.5 text-xs font-semibold text-ink hover:bg-orange-bright focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        >
          <ClipboardCheck className="h-5 w-5" aria-hidden />
          Schade melden
        </a>
      </div>
    </div>
  );
}
