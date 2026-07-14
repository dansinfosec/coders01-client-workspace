import { MessageSquareText } from "lucide-react";
import { useAssistant } from "./AssistantContext";
import { assistantConfig } from "./assistantConfig";

/** Floating button that opens the Dakassistent. Hidden while the panel is open. */
export function AssistantLauncher() {
  const { open, openAssistant } = useAssistant();
  if (open) return null;
  return (
    <button
      type="button"
      onClick={openAssistant}
      aria-label={`${assistantConfig.name} openen`}
      className="inline-flex items-center gap-2 rounded-full bg-green px-4 py-3 font-semibold text-navy shadow-lift transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <MessageSquareText className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Dakassistent</span>
    </button>
  );
}
