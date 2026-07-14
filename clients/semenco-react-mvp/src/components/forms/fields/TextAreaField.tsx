import { useId } from "react";
import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../ApplicationForm/applicationFormSchema";
import { cn } from "@/utils/cn";
import { descriptionClass, errorClass, inputClass, labelClass } from "./fieldStyles";

interface TextAreaFieldProps {
  name: keyof ApplicationFormValues;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

/** Accessible multi-line text input wired to react-hook-form. */
export function TextAreaField({
  name,
  label,
  description,
  placeholder,
  required,
  rows = 4,
}: TextAreaFieldProps) {
  const { register, formState } = useFormContext<ApplicationFormValues>();
  const id = useId();
  const descId = `${id}-desc`;
  const errId = `${id}-err`;
  const error = formState.errors[name];
  const describedBy = cn(description ? descId : undefined, error ? errId : undefined);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {description && (
        <p id={descId} className={descriptionClass}>
          {description}
        </p>
      )}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...register(name)}
      />
      {error && (
        <p id={errId} role="alert" className={errorClass}>
          {String(error.message)}
        </p>
      )}
    </div>
  );
}
