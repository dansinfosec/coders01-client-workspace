import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "red" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  // Cream primary with ink text (cream is light → ink text ~16:1, accessible)
  primary: "bg-cream text-ink hover:bg-cream-strong",
  // Deep red with off-white text (~7.5:1)
  red: "bg-red text-text-strong hover:bg-red-bright",
  outline: "border border-cream/40 text-cream hover:bg-cream/10",
  ghost: "text-cream hover:bg-cream/10",
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

type AsButton = StyleProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type AsAnchor = StyleProps & {
  href: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

export type ButtonProps = AsButton | AsAnchor;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant = "primary", size = "md", className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

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
