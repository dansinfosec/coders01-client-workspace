import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Narrower width for long-form reading (e.g. blog articles). */
  width?: "default" | "prose";
}

/**
 * Horizontally-centred content wrapper enforcing the maximum readable width and
 * consistent responsive gutters. Prevents full-bleed text on large screens.
 */
export function PageContainer({
  children,
  width = "default",
  className,
  ...rest
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        width === "prose" ? "max-w-prose" : "max-w-content",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
