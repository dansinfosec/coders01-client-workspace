import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "bg-surface text-text-primary border border-border hover:bg-surface-muted",
  ghost: "text-brand hover:bg-brand-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm min-h-9",
  md: "px-5 py-2.5 text-base min-h-11",
  lg: "px-6 py-3 text-base min-h-12",
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

type ButtonAsButton = StyleProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: never };

type ButtonAsLink = StyleProps & {
  /** Internal route path; renders a React Router <Link>. */
  to: string;
  children: ReactNode;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Shared button. Renders a router <Link> when `to` is provided, otherwise a
 * native <button>. Minimum tap targets keep it usable on touch screens.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props,
  ref,
) {
  const { variant = "primary", size = "md", className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {props.children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, type, ...rest } = props;
  return <button ref={ref} type={type ?? "button"} className={classes} {...rest} />;
});
