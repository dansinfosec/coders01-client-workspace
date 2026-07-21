import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
  as?: "h1" | "h2";
}

/** Consistent eyebrow + title + intro block for section headers. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  invert = false,
  as = "h2",
}: SectionHeadingProps) {
  const Title = as;
  return (
    <div className={cn("max-w-prose", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className={cn("eyebrow", invert && "text-green")}>{eyebrow}</p>}
      <Title
        className={cn(
          "mt-2 text-3xl sm:text-4xl",
          invert && "text-text-invert",
        )}
      >
        {title}
      </Title>
      {intro && (
        <p className={cn("mt-4 text-lg", invert ? "text-text-invert/80" : "text-text-body")}>
          {intro}
        </p>
      )}
    </div>
  );
}
