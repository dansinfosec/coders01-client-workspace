type ClassValue = string | number | false | null | undefined;

/** Tiny class-name joiner (no dependency). */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
