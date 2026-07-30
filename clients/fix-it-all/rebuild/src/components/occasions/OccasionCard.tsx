import { Link } from "react-router-dom";
import { ArrowRight, Gauge, Fuel, Cog, Calendar } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { OccasionMedia } from "@/components/occasions/OccasionMedia";
import type { Occasion } from "@/data/occasions";
import { formatPrijs, formatKm, transmissieLabel } from "@/lib/occasion";
import { paths } from "@/routes/paths";
import { cn } from "@/utils/cn";

interface OccasionCardProps {
  occasion: Occasion;
  /** Compacte, horizontale lijstweergave i.p.v. de galerijkaart. */
  layout?: "grid" | "list";
}

export function OccasionCard({ occasion: o, layout = "grid" }: OccasionCardProps) {
  const to = paths.occasion(o.slug);
  const sold = o.status === "verkocht";

  if (layout === "list") {
    return (
      <Link
        to={to}
        className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface p-3 transition-all hover:border-petrol/40 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol sm:flex-row"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-[4/3] sm:w-56">
          <OccasionMedia occasion={o} showPlate={false} />
          <div className="absolute left-2 top-2">
            <StatusPill status={o.status} solid />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1 pr-2">
          <div>
            <h3 className="font-display text-lg font-bold text-text-strong">{o.title}</h3>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-label text-text-muted">
              <li className="min-w-0 break-words">{o.bouwjaar}</li>
              <li className="min-w-0 break-words">{formatKm(o.kmStand)}</li>
              <li className="min-w-0 break-words">{o.brandstof}</li>
              <li className="min-w-0 break-words">{o.transmissie ? transmissieLabel[o.transmissie] : o.carrosserie}</li>
            </ul>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className={cn("font-display text-lg font-bold", sold ? "text-text-muted line-through" : "text-petrol-strong")}>
              {formatPrijs(o.prijs)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-petrol group-hover:gap-2">
              Bekijk <ArrowRight className="h-4 w-4 transition-all" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-petrol/40 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <OccasionMedia occasion={o} />
        <div className="absolute left-3 top-3">
          <StatusPill status={o.status} solid />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-text-strong">{o.title}</h3>
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-text-body">
          <li className="flex min-w-0 items-start gap-2">
            <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
            <span className="min-w-0 break-words leading-snug">{formatKm(o.kmStand)}</span>
          </li>
          <li className="flex min-w-0 items-start gap-2">
            <Fuel className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
            <span className="min-w-0 break-words leading-snug">{o.brandstof}</span>
          </li>
          <li className="flex min-w-0 items-start gap-2">
            <Cog className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
            <span className="min-w-0 break-words leading-snug">
              {o.transmissie ? transmissieLabel[o.transmissie] : o.carrosserie}
            </span>
          </li>
          <li className="flex min-w-0 items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
            <span className="min-w-0 break-words leading-snug">{o.bouwjaar}</span>
          </li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <span className={cn("font-display text-xl font-bold", sold ? "text-text-muted line-through" : "text-petrol-strong")}>
            {formatPrijs(o.prijs)}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-petrol transition-all group-hover:gap-2">
            Bekijk <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
