import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import type { ApplicationFormValues } from "./applicationFormSchema";
import { useApplicationSteps } from "./ApplicationFormProvider";

/**
 * Accessible error summary shown when advancing a step fails validation. Lists
 * the current step's errors; each item focuses its field. Receives focus when
 * it appears so screen-reader and keyboard users hear/see the problems.
 */
export function ApplicationErrorSummary() {
  const { current, showErrors } = useApplicationSteps();
  const { formState, setFocus } = useFormContext<ApplicationFormValues>();
  const ref = useRef<HTMLDivElement>(null);

  const items = current.fields
    .map((field) => ({ field, message: formState.errors[field]?.message }))
    .filter((i): i is { field: keyof ApplicationFormValues; message: string } => Boolean(i.message));

  useEffect(() => {
    if (showErrors && items.length > 0) ref.current?.focus();
    // Only refocus when the error state toggles on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showErrors]);

  if (!showErrors || items.length === 0) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-xl border border-error/40 bg-error/5 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-error">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        Controleer de volgende {items.length === 1 ? "vraag" : "vragen"}:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-primary">
        {items.map((item) => (
          <li key={item.field}>
            <button
              type="button"
              onClick={() => setFocus(item.field, { shouldSelect: true })}
              className="rounded text-left underline hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {String(item.message)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
