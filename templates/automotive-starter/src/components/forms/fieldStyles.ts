/** Gedeelde formulier-stijlen zodat velden overal consistent zijn (afspraak, contact, auto verkopen). */
export const field = {
  label: "mb-1.5 block text-sm font-semibold text-text-strong",
  hint: "mt-1 text-xs text-text-muted",
  errorText: "mt-1 text-xs font-medium text-error",
  input:
    "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-text-strong placeholder:text-text-muted/60 transition-colors focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/25",
  inputError: "border-error focus:border-error focus:ring-error/25",
  textarea:
    "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-text-strong placeholder:text-text-muted/60 transition-colors focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/25 min-h-[7rem] resize-y",
  select:
    "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-text-strong transition-colors focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/25",
} as const;
