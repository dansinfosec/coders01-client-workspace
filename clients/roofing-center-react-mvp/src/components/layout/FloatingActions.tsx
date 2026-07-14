import { MessageCircle } from "lucide-react";
import { AssistantLauncher } from "@/features/assistant/AssistantLauncher";
import { useAssistant } from "@/features/assistant/AssistantContext";
import { contact, whatsappLink } from "@/data/company";

/**
 * Floating actions, bottom-right, respecting the mobile safe area.
 * Stacks the WhatsApp button (only when configured) ABOVE the assistant launcher
 * so they never overlap. Hidden while the assistant panel is open to avoid
 * covering it or any form/cookie controls.
 */
export function FloatingActions() {
  const { open } = useAssistant();
  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-3"
      style={{ bottom: "calc(1rem + var(--safe-bottom))" }}
    >
      {contact.hasWhatsapp && !open && (
        <a
          href={whatsappLink("Hallo Roofing Center, ik heb een vraag over mijn platte dak.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Stuur een WhatsApp-bericht"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </a>
      )}
      <AssistantLauncher />
    </div>
  );
}
