import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  width?: "default" | "prose";
}

/** Centered content wrapper enforcing the max readable width + responsive gutters. */
export function Container({ children, width = "default", className, ...rest }: ContainerProps) {
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
