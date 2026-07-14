import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import type { ApplicationFormValues } from "../ApplicationForm/applicationFormSchema";
import type { Option } from "../ApplicationForm/applicationFormTypes";
import { cn } from "@/utils/cn";
import { errorClass } from "./fieldStyles";

interface CheckboxCardsFieldProps {
  name: keyof ApplicationFormValues;
  legend: string;
  description?: string;
  options: Option[];
  required?: boolean;
}

/**
 * Multi-select group rendered as selectable cards. Each card wraps a real
 * checkbox (registered to the same field → array of values), so keyboard and
 * screen-reader behaviour is native and accessible.
 */
export function CheckboxCardsField({
  name,
  legend,
  description,
  options,
  required,
}: CheckboxCardsFieldProps) {
  const { register, watch, formState } = useFormContext<ApplicationFormValues>();
  const id = useId();
  const errId = `${id}-err`;
  const error = formState.errors[name];
  const selected = (watch(name) as string[] | undefined) ?? [];

  return (
    <fieldset aria-describedby={error ? errId : undefined}>
      <legend className="text-sm font-medium text-text-primary">
        {legend}
        {required && <span className="text-error"> *</span>}
      </legend>
      {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors",
                "focus-within:ring-2 focus-within:ring-focus",
                isActive ? "border-brand bg-brand-soft" : "border-border bg-surface hover:bg-surface-muted",
              )}
            >
              <input
                type="checkbox"
                value={option.value}
                className="sr-only"
                {...register(name)}
              />
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  isActive ? "border-brand bg-brand text-white" : "border-border bg-surface",
                )}
                aria-hidden="true"
              >
                {isActive && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="text-sm text-text-primary">{option.label}</span>
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
