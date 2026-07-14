import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import { primaryNavigation } from "@/data/navigation";

/** Horizontal primary navigation for wider screens. */
export function DesktopNavigation() {
  return (
    <nav aria-label="Hoofdnavigatie" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {primaryNavigation.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  isActive
                    ? "bg-brand-soft text-brand-strong"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                )
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
