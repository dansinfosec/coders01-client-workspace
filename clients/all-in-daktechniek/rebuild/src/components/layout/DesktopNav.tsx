import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import { mainNav } from "@/data/navigation";

/** Horizontal primary navigation (on the ink header) for wide screens. */
export function DesktopNav() {
  return (
    <nav aria-label="Hoofdnavigatie" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {mainNav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                  isActive
                    ? "text-green"
                    : "text-text-invert/80 hover:text-text-invert hover:bg-ink-800",
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
