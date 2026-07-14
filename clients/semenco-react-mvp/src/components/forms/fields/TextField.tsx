import { useId } from "react";
import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../ApplicationForm/applicationFormSchema";
import { cn } from "@/utils/cn";
import { descriptionClass, errorClass, inputClass, labelClass } from "./fieldStyles";

interface TextFieldProps {
  name: keyof ApplicationFormValues;
  label: string;
  type?: "text" | "email" | "tel";
  description?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
}

/**
 * Accessible single-line text input wired to react-hook-form. Label, optional
 * description and validation message are all programmatically associated with
 * the input (htmlFor / aria-describedby / aria-invalid / role="alert").
 */
export function TextField({
  name,
  label,
  type = "text",
  description,
  placeholder,
  required,
  autoComplete,
  inputMode,
}: TextFieldProps) {
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
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
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
