import type { Choice } from "./assistantTypes";

interface AssistantOptionsProps {
  choices: Choice[];
  onSelect: (value: string) => void;
  ariaLabel: string;
}

/** Selectable option buttons for an assistant step. */
export function AssistantOptions({ choices, onSelect, ariaLabel }: AssistantOptionsProps) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-col gap-2">
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onSelect(c.value)}
          className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left text-sm font-medium text-text-strong transition-colors hover:border-green hover:bg-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
