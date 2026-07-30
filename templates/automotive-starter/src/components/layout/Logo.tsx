import { Link } from "react-router-dom";
import { paths } from "@/routes/paths";
import { brand } from "@/config/brand";
import { company } from "@/data/company";
import { cn } from "@/utils/cn";

interface LogoProps {
  /** true op donkere achtergrond (header/footer). */
  invert?: boolean;
  className?: string;
}

/**
 * Logo — toont een afbeelding als `brand.logo.imageSrc` is ingesteld, anders een
 * tekstwordmark. Volledig gestuurd vanuit `config/brand.ts`; geen hardgecodeerde
 * merknaam hier.
 */
export function Logo({ invert, className }: LogoProps) {
  const { logo } = brand;
  const imageSrc = invert ? logo.imageSrcInvert ?? logo.imageSrc : logo.imageSrc;

  return (
    <Link
      to={paths.home}
      aria-label={`${company.name} — naar de homepage`}
      className={cn("group inline-flex items-baseline gap-1.5 font-display font-extrabold tracking-tightish", className)}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={company.name} className="h-8 w-auto" />
      ) : (
        <>
          <span className={cn("text-xl leading-none", invert ? "text-paper" : "text-asphalt-900")}>{logo.text}</span>
          {logo.badge && (
            <span
              className={cn(
                "rounded-[0.3rem] px-1.5 py-0.5 text-xl leading-none",
                invert ? "bg-petrol text-white" : "bg-asphalt-900 text-paper",
              )}
            >
              {logo.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
