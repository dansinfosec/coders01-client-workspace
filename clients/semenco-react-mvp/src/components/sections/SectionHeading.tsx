import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  /** Small label above the title. */
  eyebrow?: string;
  title: string;
  /** Heading level — pages have one <h1>, sections usually use h2. */
  as?: "h1" | "h2" | "h3";
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Consistent section title block (eyebrow + heading + optional description). */
export function SectionHeading({
  eyebrow,
  title,
  as: Heading = "h2",
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-prose",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">
          {eyebrow}
        </p>
      )}
      <Heading className="text-2xl sm:text-3xl text-text-primary">{title}</Heading>
      {description && (
        <div className="mt-3 text-base leading-relaxed text-text-secondary">
          {description}
        </div>
      )}
    </div>
  );
}
