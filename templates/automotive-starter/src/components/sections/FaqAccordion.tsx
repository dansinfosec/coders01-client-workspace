import { ChevronDown } from "lucide-react";
import type { ServiceFAQ } from "@/data/services";

interface FaqAccordionProps {
  items: ServiceFAQ[];
}

/** Toegankelijke FAQ via native <details>/<summary> (werkt zonder JS, toetsenbordvriendelijk). */
export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-surface">
      {items.map((item, i) => (
        <details key={i} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-base font-bold text-text-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol">
            {item.q}
            <ChevronDown className="h-5 w-5 shrink-0 text-text-muted transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-5 pr-8 text-sm leading-relaxed text-text-body">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
