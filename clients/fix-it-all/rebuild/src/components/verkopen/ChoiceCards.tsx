import type { ChoiceGroup } from "@/data/vehicleSale";
import { cn } from "@/utils/cn";

interface ChoiceCardsProps {
  group: ChoiceGroup;
  value: string;
  onChange: (value: string) => void;
}

/** Toegankelijke keuzekaarten (radiogroup) i.p.v. dropdowns — duidelijk en groot genoeg voor mobiel. */
export function ChoiceCards({ group, value, onChange }: ChoiceCardsProps) {
  const cols = group.cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-semibold text-text-strong">{group.label}</legend>
      <div role="radiogroup" aria-label={group.label} className={cn("grid grid-cols-2 gap-2", cols)}>
        {group.options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex flex-col items-start rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
                active ? "border-petrol bg-petrol-soft" : "border-line bg-surface hover:border-petrol/40",
              )}
            >
              <span className={cn("text-sm font-semibold", active ? "text-petrol-strong" : "text-text-strong")}>
                {opt.label}
              </span>
              {opt.hint && <span className="mt-0.5 text-xs text-text-muted">{opt.hint}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
