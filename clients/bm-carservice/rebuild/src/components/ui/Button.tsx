import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export type ButtonVariant = "mark" | "ink" | "outline" | "onInk" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  // Primary: BM red (mark) with white text. Reserved for the main action (afspraak/bel).
  mark: "bg-mark text-white hover:bg-mark-strong focus-visible:ring-mark focus-visible:ring-offset-surface",
  // Ink: anthracite fill for secondary actions on light surfaces.
  ink: "bg-ink text-text-invert hover:bg-ink-800 focus-visible:ring-focus focus-visible:ring-offset-surface",
  outline:
    "border border-ink/25 bg-transparent text-text-strong hover:bg-surface-muted focus-visible:ring-focus focus-visible:ring-offset-surface",
  ghost:
    "text-mark-strong hover:bg-mark/10 focus-visible:ring-mark focus-visible:ring-offset-surface",
  // For use on the dark ink background — signal-yellow focus ring for visibility.
  onInk:
    "border border-line-invert bg-ink-800 text-text-invert hover:bg-ink-700 focus-visible:ring-signal focus-visible:ring-offset-ink",
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
type AsLink = StyleProps & { to: string; href?: never; children: ReactNode; onClick?: () => void };
type AsAnchor = StyleProps & {
  href: string;
  to?: never;
  children: ReactNode;
  target?: string;
  rel?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

export type ButtonProps = AsButton | AsLink | AsAnchor;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant = "mark", size = "md", className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("to" in props && props.to !== undefined) {
    return (
      <Link to={props.to} onClick={props.onClick} className={classes}>
        {props.children}
      </Link>
    );
  }
  if ("href" in props && props.href !== undefined) {
    const { href, children, target, rel, onClick } = props;
    return (
      <a href={href} target={target} rel={rel} onClick={onClick} className={classes} aria-label={props["aria-label"]}>
        {children}
      </a>
    );
  }
  const { variant: _v, size: _s, className: _c, type, ...rest } = props as AsButton;
  return <button ref={ref} type={type ?? "button"} className={classes} {...rest} />;
});
