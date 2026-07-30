import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { groupOpties } from "@/lib/occasion";
import { cn } from "@/utils/cn";

interface OccasionOptionsProps {
  opties: string[];
}

/**
 * Opties/uitrusting als toegankelijke accordions per categorie. Alleen gevulde categorieën
 * worden getoond; niets wordt verzonnen. De eerste categorie staat standaard open.
 */
export function OccasionOptions({ opties }: OccasionOptionsProps) {
  const groups = groupOpties(opties);
  const [open, setOpen] = useState<Set<string>>(() => new Set(groups.slice(0, 1).map((g) => g.title)));

  if (groups.length === 0) return null;

  const toggle = (title: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {groups.map((g) => {
        const isOpen = open.has(g.title);
        const panelId = `opties-${g.title.replace(/\s+/g, "-").toLowerCase()}`;
        return (
          <div key={g.title}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(g.title)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
              >
                <span className="font-display text-base font-bold text-text-strong">
                  {g.title} <span className="font-sans font-normal text-text-muted">({g.items.length})</span>
                </span>
                <ChevronDown
                  className={cn("h-5 w-5 shrink-0 text-text-muted transition-transform", isOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
            </h3>
            {isOpen && (
              <ul
                id={panelId}
                className="grid gap-x-6 gap-y-2 px-5 pb-5 text-sm text-text-body sm:grid-cols-2 lg:grid-cols-3"
              >
                {g.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
