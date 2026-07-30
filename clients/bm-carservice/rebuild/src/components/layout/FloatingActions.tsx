import { Phone, MessageCircle } from "lucide-react";
import { company } from "@/data/company";

const whatsappUrl = `https://wa.me/${company.phone.whatsapp}`;

/** Sticky mobile call + WhatsApp actions — one-tap contact, the walk-in advantage. */
export function FloatingActions() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur sm:hidden">
      <div
        className="grid grid-cols-2 gap-2 p-2"
        style={{ paddingBottom: "calc(0.5rem + var(--safe-bottom))" }}
      >
        <a
          href={company.phone.href}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mark font-semibold text-white"
        >
          <Phone className="h-5 w-5" /> Bel direct
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink font-semibold text-text-invert"
        >
          <MessageCircle className="h-5 w-5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
