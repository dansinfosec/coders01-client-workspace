import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { services } from "@/data/services";
import { ROUTES } from "@/routes/paths";

/** Grid of confirmed flat-roof services. Each links to its section on /diensten. */
export function ServicesGrid() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <li key={s.slug}>
            <Card interactive className="flex h-full flex-col">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-soft text-green-strong">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-text-strong">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-text-muted">{s.summary}</p>
              <Link
                to={`${ROUTES.diensten}#${s.slug}`}
                className="mt-4 inline-flex items-center gap-1 rounded text-sm font-semibold text-green-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Meer over {s.title.toLowerCase()}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
