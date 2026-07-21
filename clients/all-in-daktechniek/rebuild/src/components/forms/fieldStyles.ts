import { cn } from "@/utils/cn";

export const labelClass = "block text-sm font-semibold text-text-strong";

export const inputClass = (hasError: boolean): string =>
  cn(
    "mt-1.5 block w-full rounded-lg border bg-surface px-3.5 py-2.5 text-base text-text-strong",
    "placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
    hasError ? "border-error" : "border-line",
  );

export const errorClass = "mt-1 text-sm text-error";
