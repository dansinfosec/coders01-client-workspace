import { Phone, MessageCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

/**
 * Sticky mobile action bar: call · WhatsApp · offerte. Always within thumb reach.
 * z-40 keeps it above content but BELOW the mobile menu (backdrop z-[60],
 * panel z-[70]), so an open menu covers it. Hidden on lg+ (header has the CTAs).
 */
export function FloatingActions() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto grid max-w-content grid-cols-3">
        <a
          href={company.phonePrimary.href}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-text-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Phone className="h-5 w-5 text-green-strong" aria-hidden="true" />
          Bellen
        </a>
        <a
          href={company.whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 border-x border-line text-xs font-semibold text-text-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <MessageCircle className="h-5 w-5 text-green-strong" aria-hidden="true" />
          WhatsApp
        </a>
        <Link
          to={ROUTES.offerte}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 bg-green text-xs font-semibold text-ink hover:bg-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <FileText className="h-5 w-5" aria-hidden="true" />
          Offerte
        </Link>
      </div>
    </div>
  );
}
