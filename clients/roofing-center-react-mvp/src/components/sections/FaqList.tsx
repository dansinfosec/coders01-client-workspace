import { ChevronDown } from "lucide-react";
import type { Faq } from "@/data/faqs";

/** Accessible FAQ accordion using native <details>/<summary> (keyboard-friendly). */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="mx-auto max-w-prose divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((faq) => (
        <details key={faq.id} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown className="h-5 w-5 shrink-0 text-green-strong transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-5 pb-4 text-sm leading-relaxed text-text-muted">{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}
