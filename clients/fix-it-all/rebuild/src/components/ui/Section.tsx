import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Tone = "paper" | "surface" | "muted" | "asphalt" | "petrol";

const toneClass: Record<Tone, string> = {
  paper: "bg-paper text-text-body",
  surface: "bg-surface text-text-body",
  muted: "bg-surface-muted text-text-body",
  asphalt: "bg-asphalt text-text-invert",
  petrol: "bg-petrol-strong text-text-invert",
};

interface SectionProps {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  /** Verticale ademruimte. */
  size?: "sm" | "md" | "lg";
  id?: string;
  as?: "section" | "div" | "article";
}

const sizeClass = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-20",
  lg: "py-20 sm:py-28",
};

export function Section({ children, className, tone = "paper", size = "md", id, as: Tag = "section" }: SectionProps) {
  return (
    <Tag id={id} className={cn(toneClass[tone], sizeClass[size], className)}>
      {children}
    </Tag>
  );
}
