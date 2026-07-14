import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ interactive, className, children, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-line bg-surface p-6 shadow-soft",
        interactive && "transition-shadow hover:shadow-card",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
