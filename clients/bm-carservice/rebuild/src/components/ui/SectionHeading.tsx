import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  /** Mono signage eyebrow, e.g. "DIENSTEN". */
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
}

/** Consistent section header: mono eyebrow + signage title + optional intro. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as = "h2",
  align = "left",
  invert = false,
  className,
}: SectionHeadingProps) {
  const Title = as;
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className={cn("eyebrow", align === "center" && "justify-center", invert && "text-signal")}>
          {eyebrow}
        </p>
      )}
      <Title
        className={cn(
          "mt-3 text-3xl leading-[1.1] sm:text-4xl",
          invert ? "text-text-invert" : "text-text-strong",
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
