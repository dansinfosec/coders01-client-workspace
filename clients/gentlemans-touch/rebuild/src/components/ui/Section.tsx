import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Container } from "./Container";

type Tone = "base" | "muted" | "black";

interface SectionProps {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  ariaLabel?: string;
  className?: string;
  width?: "default" | "prose";
}

const tones: Record<Tone, string> = {
  base: "bg-surface",
  muted: "bg-surface-muted",
  black: "bg-ink",
};

export function Section({ children, id, tone = "base", ariaLabel, className, width = "default" }: SectionProps) {
  return (
    <section id={id} aria-label={ariaLabel} className={cn(tones[tone], "py-16 sm:py-24 scroll-mt-16", className)}>
      <Container width={width}>{children}</Container>
    </section>
  );
}

interface HeadingProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, intro, center }: HeadingProps) {
  return (
    <div className={cn("max-w-prose", center && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
      <div className={cn("barber-rule mt-4 w-16 rounded", center && "mx-auto")} />
      {intro && <p className="mt-5 text-lg text-text-body">{intro}</p>}
    </div>
  );
}
