type ClassValue = string | number | false | null | undefined;

/**
 * Tiny class-name joiner (no external dependency). Filters out falsy values so
 * conditional classes read cleanly: cn("base", isActive && "active").
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
