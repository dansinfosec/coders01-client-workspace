import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
  as?: "h1" | "h2";
}

/** Consistente sectiekop: mono-eyebrow + display-titel + optionele introtekst. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  invert,
  className,
  as: Heading = "h2",
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
        <p className={cn("eyebrow mb-3", invert && "text-torque")}>{eyebrow}</p>
      )}
      <Heading
        className={cn(
          "text-balance font-display font-bold leading-[1.05] tracking-tightish",
          Heading === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl",
          invert && "text-text-invert",
        )}
      >
        {title}
      </Heading>
      {intro && (
        <p className={cn("mt-4 text-lg leading-relaxed", invert ? "text-paper/80" : "text-text-muted")}>
          {intro}
        </p>
      )}
    </div>
  );
}
