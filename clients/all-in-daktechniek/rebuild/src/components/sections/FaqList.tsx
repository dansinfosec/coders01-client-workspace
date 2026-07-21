import { faqs } from "@/data/faqs";

/** Accessible FAQ list using native <details>/<summary>. */
export function FaqList() {
  return (
    <div className="mx-auto max-w-prose divide-y divide-line rounded-2xl border border-line bg-surface">
      {faqs.map((faq) => (
        <details key={faq.question} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            {faq.question}
            <span
              className="ml-auto text-green-strong transition-transform group-open:rotate-45"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-text-body">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
