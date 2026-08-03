import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Container } from "./Container";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Removes the default max-width container (for full-bleed sections). */
  bleed?: boolean;
  "aria-labelledby"?: string;
}

/** Standard vertical section rhythm; wraps content in a Container unless `bleed`. */
export function Section({ id, children, className, bleed, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-20 py-16 sm:py-20 lg:py-24", className)}
      {...rest}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
