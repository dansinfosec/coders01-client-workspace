import { Link } from "react-router-dom";
import { paths } from "@/routes/paths";
import { cn } from "@/utils/cn";

interface LogoProps {
  /** true op donkere achtergrond (header/footer op asphalt). */
  invert?: boolean;
  className?: string;
}

/**
 * Het échte Fix-it All-logo (gearchiveerd van de live site, crawl 2026-07-30).
 * De originele asset is wit/transparant en werkt op donkere achtergronden (`invert`);
 * voor lichte achtergronden gebruiken we een merkrode variant, afgeleid uit hetzelfde
 * bestand. Zie clients/fix-it-all/docs/SCRAPED-ASSETS.md.
 */
const LOGO_LIGHT_BG = "/assets/brand/fix-it-all-logo-rood.png"; // op lichte achtergrond
const LOGO_DARK_BG = "/assets/brand/fix-it-all-logo-wit.png"; // op donkere achtergrond

export function Logo({ invert, className }: LogoProps) {
  return (
    <Link
      to={paths.home}
      aria-label="Fix-it All — naar de homepage"
      className={cn("group inline-flex items-center", className)}
    >
      <img
        src={invert ? LOGO_DARK_BG : LOGO_LIGHT_BG}
        alt="Autobedrijf Fix-it All"
        width={139}
        height={49}
        className="h-8 w-auto"
        decoding="async"
      />
    </Link>
  );
}
