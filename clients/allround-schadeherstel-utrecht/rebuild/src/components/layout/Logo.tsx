import { business } from "@/data/business";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
}

/**
 * Brand logo (supplied artwork, trimmed + optimised). It sits on an anthracite
 * surface that matches the logo's own background (#242424), so the residual
 * background blends seamlessly. The wordmark is part of the artwork, so the
 * image alt carries the business name.
 */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/images/brand/logo.webp"
      width={376}
      height={108}
      alt={`${business.name} logo`}
      className={cn("h-9 w-auto sm:h-10", className)}
      decoding="async"
    />
  );
}
