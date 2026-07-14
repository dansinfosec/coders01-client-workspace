import { useId, useRef, useState } from "react";
import { Upload, ArrowRight } from "lucide-react";
import type { AssistantStep, UploadMeta } from "./assistantTypes";
import { Button } from "@/components/ui/Button";
import { inputClass, errorClass } from "@/components/forms/fieldStyles";

interface AssistantFormStepProps {
  step: AssistantStep;
  initialValue?: string;
  uploads: UploadMeta[];
  onFiles: (metas: UploadMeta[]) => void;
  onSubmit: (value: string) => void;
}

/** Renders the input for a text / textarea / file / consent step, with validation. */
export function AssistantFormStep({ step, initialValue = "", uploads, onFiles, onSubmit }: AssistantFormStepProps) {
  const [value, setValue] = useState(step.kind === "consent" ? "false" : initialValue);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const errId = `${id}-err`;
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const v = step.kind === "consent" ? value : step.kind === "file" ? String(uploads.length) : value;
    const err = step.validate ? step.validate(v) : null;
    if (err) { setError(err); return; }
    setError(null);
    onSubmit(step.kind === "file" ? `${uploads.length} bestand(en)` : v);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step.kind !== "textarea") { e.preventDefault(); submit(); }
  };

  return (
    <div className="space-y-2">
      {step.kind === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          placeholder={step.placeholder}
          onChange={(e) => setValue(e.target.value)}
          aria-label={step.summaryLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={inputClass}
        />
      ) : step.kind === "file" ? (
        <div>
          <input
            ref={fileRef}
            id={id}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              const metas = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size, type: f.type }));
              onFiles(metas);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface px-3.5 py-3 text-sm font-medium text-text-strong hover:border-green hover:bg-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {uploads.length > 0 ? `${uploads.length} foto('s) geselecteerd` : "Foto's toevoegen"}
          </button>
          {uploads.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-text-muted">
              {uploads.map((u, i) => (
                <li key={i} className="truncate">• {u.name}</li>
              ))}
            </ul>
          )}
        </div>
      ) : step.kind === "consent" ? (
        <label className="flex items-start gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-text-body">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => setValue(e.target.checked ? "true" : "false")}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--green-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
          <span>Ja, Roofing Center mag contact met mij opnemen over deze aanvraag.</span>
        </label>
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={step.placeholder}
          inputMode={step.inputMode}
          autoComplete={step.autoComplete}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label={step.summaryLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={inputClass}
        />
      )}

      {step.help && !error && <p className="text-xs text-text-muted">{step.help}</p>}
      {error && <p id={errId} role="alert" className={errorClass}>{error}</p>}

      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={submit}>
          {step.optional && (step.kind === "file" ? uploads.length === 0 : value.trim().length === 0) ? "Overslaan" : "Volgende"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
