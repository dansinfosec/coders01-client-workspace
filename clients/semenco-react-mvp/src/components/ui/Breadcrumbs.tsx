import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/routes/paths";

export interface Crumb {
  label: string;
  /** Omit `to` for the current (last) page. */
  to?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

/**
 * Accessible breadcrumb trail. Always starts at Home. The last item is marked
 * as the current page and is not a link.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const crumbs: Crumb[] = [{ label: "Home", to: ROUTES.home }, ...items];

  return (
    <nav aria-label="Kruimelpad" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-text-secondary">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {crumb.to && !isLast ? (
                <Link to={crumb.to} className="rounded hover:text-brand hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-text-primary">
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-4 w-4 shrink-0 text-border" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
