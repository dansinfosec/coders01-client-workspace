import { useId } from "react";
import { useFormContext } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import type { ApplicationFormValues } from "../ApplicationForm/applicationFormSchema";
import { cn } from "@/utils/cn";
import { errorClass } from "./fieldStyles";

export interface RadioCardItem {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface RadioCardsFieldProps {
  name: keyof ApplicationFormValues;
  legend: string;
  description?: string;
  items: RadioCardItem[];
  required?: boolean;
  columns?: 1 | 2;
}

/**
 * Single-select group rendered as large selectable cards, each wrapping a real
 * radio input (visually hidden) for full keyboard/AT support.
 */
export function RadioCardsField({
  name,
  legend,
  description,
  items,
  required,
  columns = 2,
}: RadioCardsFieldProps) {
  const { register, watch, formState } = useFormContext<ApplicationFormValues>();
  const id = useId();
  const errId = `${id}-err`;
  const error = formState.errors[name];
  const selected = watch(name);

  return (
    <fieldset aria-describedby={error ? errId : undefined}>
      <legend className="text-sm font-medium text-text-primary">
        {legend}
        {required && <span className="text-error"> *</span>}
      </legend>
      {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}

      <div className={cn("mt-3 grid gap-3", columns === 2 && "sm:grid-cols-2")}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = selected === item.value;
          return (
            <label
              key={item.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                "focus-within:ring-2 focus-within:ring-focus",
                isActive ? "border-brand bg-brand-soft" : "border-border bg-surface hover:bg-surface-muted",
              )}
            >
              <input type="radio" value={item.value} className="sr-only" {...register(name)} />
              {Icon && (
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isActive ? "bg-brand text-white" : "bg-surface-muted text-brand",
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
              )}
              <span>
                <span className="block font-medium text-text-primary">{item.label}</span>
                {item.description && (
                  <span className="mt-0.5 block text-sm text-text-secondary">{item.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errId} role="alert" className={`mt-2 ${errorClass}`}>
          {String(error.message)}
        </p>
      )}
    </fieldset>
  );
}
