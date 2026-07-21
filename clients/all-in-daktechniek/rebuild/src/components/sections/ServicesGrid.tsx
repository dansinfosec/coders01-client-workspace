import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { servicesPath } from "@/routes/paths";

/** Grid of all services with icon, summary and link to the detail page. */
export function ServicesGrid() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <li key={service.slug}>
            <Link
              to={servicesPath(service.slug)}
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-soft transition-colors hover:border-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-soft text-green-strong">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-text-strong">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm text-text-body">{service.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-strong">
                Meer over {service.title.toLowerCase()}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
