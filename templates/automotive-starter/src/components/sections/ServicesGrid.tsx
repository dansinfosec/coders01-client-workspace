import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { paths } from "@/routes/paths";
import { cn } from "@/utils/cn";

interface ServicesGridProps {
  className?: string;
}

/** Dienstenrooster — een catalogus (géén genummerde sequentie). Herbruikt op home + /diensten. */
export function ServicesGrid({ className }: ServicesGridProps) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <li key={service.slug}>
            <Link
              to={paths.dienst(service.slug)}
              className="group flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-petrol/40 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-petrol-soft text-petrol-strong">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <ArrowUpRight className="h-5 w-5 text-text-muted transition-colors group-hover:text-petrol" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text-strong">{service.shortLabel}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{service.summary}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
