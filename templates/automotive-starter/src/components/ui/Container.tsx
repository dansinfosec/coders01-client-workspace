import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Bredere variant voor showcase-rijen. */
  wide?: boolean;
}

/** Centrale, responsive contentbreedte met consistente zijmarges. */
export function Container({ children, className, wide }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", wide ? "max-w-wide" : "max-w-content", className)}>
      {children}
    </div>
  );
}
