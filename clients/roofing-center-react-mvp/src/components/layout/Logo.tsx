import { Link } from "react-router-dom";
import { logoAssets } from "@/lib/images";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/utils/cn";

interface LogoProps {
  variant?: "white" | "navy";
  className?: string;
}

/** Brand logo (derived transparent variant), links to the homepage. */
export function Logo({ variant = "white", className }: LogoProps) {
  const src = variant === "white" ? logoAssets.white : logoAssets.navy;
  return (
    <Link
      to={ROUTES.home}
      aria-label={`${company.name} — naar de homepage`}
      className="inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
    >
      <img
        src={src}
        alt={company.name}
        width={logoAssets.width}
        height={logoAssets.height}
        className={cn("h-8 w-auto sm:h-9", className)}
        fetchPriority="high"
      />
    </Link>
  );
}
