import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/data/services";
import { servicePath } from "@/data/services";
import { cn } from "@/utils/cn";

/**
 * "Dienstenbord" — a service catalogue grid (not a sequence, so no 01/02/03 numbering).
 * Each card: signage icon, title, one line, and a mono price tag when known.
 */
export function ServicesGrid({ items }: { items: Service[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service) => {
        const Icon = service.icon;
        return (
          <li key={service.slug}>
            <Link
              to={servicePath(service)}
              className={cn(
                "group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition-colors",
                "hover:border-ink/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
              )}
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-signal">
                  <Icon className="h-5 w-5" />
                </span>
                {service.priceFrom && (
                  <span className="font-mono text-xs font-semibold uppercase tracking-wide text-text-muted">
                    v.a. {service.priceFrom}
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text-strong">{service.title}</h3>
              <p className="mt-1.5 flex-1 text-sm text-text-body">{service.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mark-strong">
                Meer info
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
