import { Check } from "lucide-react";
import { werkzaamheden } from "@/data/werkzaamheden";
import { fieldBase, labelBase } from "@/components/forms/fieldStyles";
import { cn } from "@/utils/cn";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
  toelichting: string;
  onToelichting: (value: string) => void;
  /** When given, only these werkzaamheid ids are shown (this branch's offered services). */
  allowedIds?: string[];
}

const formatDuration = (min: number) => (min >= 60 ? `± ${(min / 60).toFixed(min % 60 ? 1 : 0)} uur` : `± ${min} min`);

/** Rich, multi-select job cards: title, description, price, action, indicative duration. */
export function ServiceCards({ selected, onToggle, toelichting, onToelichting, allowedIds }: Props) {
  const andersSelected = selected.includes("anders");
  const items = allowedIds ? werkzaamheden.filter((w) => allowedIds.includes(w.id)) : werkzaamheden;

  return (
    <div>
      <ul className="space-y-2.5" role="group" aria-label="Werkzaamheden">
        {items.map((w) => {
          const isSelected = selected.includes(w.id);
          const Icon = w.icon;
          return (
            <li key={w.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => onToggle(w.id)}
                className={cn(
                  "flex w-full items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
                  isSelected ? "border-mark bg-mark/5" : "border-line bg-surface hover:border-ink/30",
                )}
              >
                {/* Accessible checkbox indicator */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors",
                    isSelected ? "border-mark bg-mark text-white" : "border-ink/30 bg-surface text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>

                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors",
                    isSelected ? "bg-mark text-white" : "bg-ink text-signal",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold text-text-strong">{w.label}</span>
                    {w.price && (
                      <span className="font-mono text-sm font-semibold text-text-strong">{w.price}</span>
                    )}
                  </span>
                  {w.description && <span className="mt-1 block text-sm text-text-body">{w.description}</span>}
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    {w.action && (
                      <span className="inline-flex items-center bg-signal px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-ink">
                        {w.action}
                      </span>
                    )}
                    <span className="font-mono text-xs text-text-muted">{formatDuration(w.durationMin)}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {andersSelected && (
        <div className="mt-4">
          <label htmlFor="toelichting" className={labelBase}>
            Beschrijf kort welke werkzaamheden u wilt laten uitvoeren.
          </label>
          <textarea
            id="toelichting"
            rows={3}
            className={cn(fieldBase, "mt-2")}
            value={toelichting}
            onChange={(e) => onToelichting(e.target.value)}
            placeholder="Bijv. ruitenwissers vervangen en een piepend geluid bij het remmen"
          />
        </div>
      )}

      <p className="mt-3 font-mono text-xs text-text-muted">Duur is indicatief.</p>
    </div>
  );
}
