import { Check } from "lucide-react";
import { company } from "@/data/company";

/** BM's headline advantages (from the live site), as a checked list. */
export function UspList({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {company.usps.map((usp) => (
        <li key={usp} className="flex items-start gap-3 py-2">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-signal">
            <Check className="h-4 w-4 text-ink" />
          </span>
          <span className="text-text-body">{usp}</span>
        </li>
      ))}
    </ul>
  );
}
