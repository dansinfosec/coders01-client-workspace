import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Container } from "./Container";

type Tone = "default" | "muted" | "ink" | "green";

interface SectionProps {
  children: ReactNode;
  tone?: Tone;
  spacing?: "md" | "lg";
  width?: "default" | "prose";
  id?: string;
  ariaLabel?: string;
  className?: string;
}

const tones: Record<Tone, string> = {
  default: "bg-surface text-text-body",
  muted: "bg-surface-muted text-text-body",
  ink: "bg-ink text-text-invert",
  green: "bg-green-soft text-text-body",
};

const spacings = { md: "py-12 sm:py-16", lg: "py-16 sm:py-24" };

export function Section({
  children,
  tone = "default",
  spacing = "lg",
  width = "default",
  id,
  ariaLabel,
  className,
}: SectionProps) {
  return (
    <section id={id} aria-label={ariaLabel} className={cn(tones[tone], spacings[spacing], className)}>
      <Container width={width}>{children}</Container>
    </section>
  );
}
