import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { getServiceImage, serviceImageAlt } from "@/config/assets";
import { paths } from "@/routes/paths";
import { cn } from "@/utils/cn";

interface ServicesGridProps {
  className?: string;
}

/** Dienstenrooster — image cards (icoon als ondersteunende badge). Herbruikt op /diensten. */
export function ServicesGrid({ className }: ServicesGridProps) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {services.map((service) => {
        const Icon = service.icon;
        const img = getServiceImage(service.slug);
        return (
          <li key={service.slug}>
            <Link
              to={paths.dienst(service.slug)}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-petrol/40 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-asphalt">
                {img ? (
                  <img
                    src={img}
                    alt={serviceImageAlt(service.shortLabel)}
                    width={1600}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                  />
                ) : (
                  <div className="blueprint absolute inset-0 opacity-40" aria-hidden />
                )}
                <span className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-asphalt-900/70 text-paper backdrop-blur">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-text-strong">{service.shortLabel}</h3>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-text-muted transition-colors group-hover:text-petrol"
                    aria-hidden
                  />
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{service.summary}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
