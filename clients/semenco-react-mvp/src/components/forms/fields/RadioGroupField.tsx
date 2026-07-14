import { useId } from "react";
import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../ApplicationForm/applicationFormSchema";
import { errorClass } from "./fieldStyles";

interface Option {
  value: string;
  label: string;
}

interface RadioGroupFieldProps {
  name: keyof ApplicationFormValues;
  legend: string;
  options: Option[];
  required?: boolean;
}

/**
 * Accessible radio group built on a fieldset/legend. Each option is a real
 * <input type="radio"> so keyboard and screen-reader behaviour is native.
 */
export function RadioGroupField({ name, legend, options, required }: RadioGroupFieldProps) {
  const { register, formState } = useFormContext<ApplicationFormValues>();
  const id = useId();
  const errId = `${id}-err`;
  const error = formState.errors[name];

  return (
    <fieldset aria-describedby={error ? errId : undefined} aria-invalid={error ? true : undefined}>
      <legend className="text-sm font-medium text-text-primary">
        {legend}
        {required && <span className="text-error"> *</span>}
      </legend>
      <div className="mt-2 flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 hover:bg-surface-muted"
          >
            <input
              type="radio"
              value={option.value}
              className="h-4 w-4 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              {...register(name)}
            />
            <span className="text-sm text-text-primary">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errId} role="alert" className={`mt-2 ${errorClass}`}>
          {String(error.message)}
        </p>
      )}
    </fieldset>
  );
}
