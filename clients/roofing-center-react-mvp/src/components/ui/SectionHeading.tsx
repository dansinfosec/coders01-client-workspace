import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  as?: "h1" | "h2" | "h3";
  description?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
}

/** Consistent section title block (eyebrow + heading + optional description). */
export function SectionHeading({ eyebrow, title, as: Heading = "h2", description, align = "left", invert = false, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-prose", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow", invert && "text-green")}>
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-green" />
          {eyebrow}
        </p>
      )}
      <Heading className={cn("mt-3 text-3xl sm:text-4xl", invert && "text-text-invert")}>{title}</Heading>
      {description && (
        <div className={cn("mt-4 text-base leading-relaxed", invert ? "text-text-invert/80" : "text-text-muted")}>
          {description}
        </div>
      )}
    </div>
  );
}
