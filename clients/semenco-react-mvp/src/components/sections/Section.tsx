import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { PageContainer } from "@/components/layout/PageContainer";

interface SectionProps {
  children: ReactNode;
  /** Background treatment. */
  tone?: "default" | "muted" | "brand";
  /** Vertical padding scale. */
  spacing?: "md" | "lg";
  width?: "default" | "prose";
  /** Optional accessible label for the section landmark. */
  ariaLabel?: string;
  className?: string;
  id?: string;
}

const tones: Record<NonNullable<SectionProps["tone"]>, string> = {
  default: "bg-background",
  muted: "bg-surface-muted",
  brand: "bg-brand-soft",
};

const spacings: Record<NonNullable<SectionProps["spacing"]>, string> = {
  md: "py-10 sm:py-14",
  lg: "py-14 sm:py-20",
};

/**
 * A full-width band with a centred, width-constrained container inside. Use to
 * compose page content consistently without repeating layout code.
 */
export function Section({
  children,
  tone = "default",
  spacing = "lg",
  width = "default",
  ariaLabel,
  className,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(tones[tone], spacings[spacing], className)}
    >
      <PageContainer width={width}>{children}</PageContainer>
    </section>
  );
}
