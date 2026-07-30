import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

type Variant = "primary" | "accent" | "outline" | "outlineInvert" | "ghost" | "invert";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tightish transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<Variant, string> = {
  // Merk-CTA (petrol). Hoofdactie.
  primary: "bg-petrol text-white hover:bg-petrol-strong focus-visible:outline-petrol",
  // Functionele energie (torque). Bewust spaarzaam — bijv. "Auto verkopen".
  accent: "bg-torque text-asphalt-900 hover:bg-torque-strong hover:text-white focus-visible:outline-torque",
  outline:
    "border border-line-strong bg-transparent text-text-strong hover:border-petrol hover:text-petrol focus-visible:outline-petrol",
  // Outline-variant voor donkere achtergronden (asphalt-hero's). Betrouwbaar lichte tekst.
  outlineInvert:
    "border border-line-invert bg-transparent text-paper hover:border-petrol-soft hover:text-petrol-soft focus-visible:outline-paper",
  ghost: "bg-transparent text-text-strong hover:bg-surface-muted focus-visible:outline-petrol",
  // Voor donkere achtergronden.
  invert: "bg-paper text-asphalt-900 hover:bg-white focus-visible:outline-paper",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base sm:h-14 sm:px-7",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Volle breedte (handig in drawer/mobiel). */
  block?: boolean;
}

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type AsLink = CommonProps & { to: string; href?: undefined };
type AsAnchor = CommonProps & { href: string; to?: undefined };

type ButtonProps = AsButton | AsLink | AsAnchor;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, block, ...rest } = props;
  const cls = cn(base, variants[variant], sizes[size], block && "w-full", className);

  if ("to" in props && props.to !== undefined) {
    const { to } = props;
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href !== undefined) {
    const { href } = props;
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  // Strip link-only keys before spreading onto <button>.
  const { to: _to, href: _href, ...buttonProps } = rest as Record<string, unknown>;
  void _to;
  void _href;
  return (
    <button className={cls} {...(buttonProps as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
