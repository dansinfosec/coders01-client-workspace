import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Slightly lift the card on hover (use for linked cards). */
  interactive?: boolean;
}

/** A soft, rounded surface panel. Restrained shadow, calm styling. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-soft",
        interactive && "transition-shadow hover:shadow-card",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
