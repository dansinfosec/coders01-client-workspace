import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "onNavy" | "outlineNavy";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  // Green primary with dark navy text (green is light → dark text is accessible)
  primary: "bg-green text-navy hover:bg-green/90 focus-visible:ring-offset-surface",
  secondary: "bg-navy text-text-invert hover:bg-navy-800 focus-visible:ring-offset-surface",
  outlineNavy: "border border-navy/25 bg-surface text-text-strong hover:bg-surface-muted focus-visible:ring-offset-surface",
  ghost: "text-green-strong hover:bg-green-soft focus-visible:ring-offset-surface",
  // For use on dark navy backgrounds
  onNavy: "border border-line-invert bg-navy-800 text-text-invert hover:bg-navy-700 focus-visible:ring-offset-navy",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm min-h-9",
  md: "px-5 py-2.5 text-base min-h-11",
  lg: "px-6 py-3 text-base min-h-12",
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

type AsButton = StyleProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never };
type AsLink = StyleProps & { to: string; href?: never; children: ReactNode };
type AsAnchor = StyleProps & { href: string; to?: never; children: ReactNode; target?: string; rel?: string; "aria-label"?: string };

export type ButtonProps = AsButton | AsLink | AsAnchor;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant = "primary", size = "md", className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("to" in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {props.children}
      </Link>
    );
  }
  if ("href" in props && props.href !== undefined) {
    const { href, children, target, rel } = props;
    return (
      <a href={href} target={target} rel={rel} className={classes} aria-label={props["aria-label"]}>
        {children}
      </a>
    );
  }
  const { variant: _v, size: _s, className: _c, type, ...rest } = props as AsButton;
  return <button ref={ref} type={type ?? "button"} className={classes} {...rest} />;
});
