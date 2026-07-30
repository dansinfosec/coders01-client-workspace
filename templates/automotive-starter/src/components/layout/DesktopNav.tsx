import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { cn } from "@/utils/cn";

const linkBase =
  "relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-text-body transition-colors hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol";
const activeClass = "text-petrol";

/** Desktop-hoofdnavigatie met toegankelijke Diensten-dropdown. */
export function DesktopNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Sluit dropdown bij routewissel.
  useEffect(() => setOpen(false), [pathname]);

  // Sluit bij klik buiten en bij Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-0.5 lg:flex">
      {primaryNav.map((item) =>
        item.children ? (
          <div
            key={item.label}
            ref={wrapRef}
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
              className={cn(linkBase, pathname.startsWith(item.to) && activeClass)}
            >
              {item.label}
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
            </button>

            <div
              id={menuId}
              role="menu"
              className={cn(
                "absolute left-0 top-full z-50 w-[22rem] pt-2 transition",
                open ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              <div className="overflow-hidden rounded-xl border border-line bg-surface p-2 shadow-card">
                {item.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    role="menuitem"
                    className={({ isActive }) =>
                      cn(
                        "block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol",
                        isActive && "bg-surface-muted",
                      )
                    }
                  >
                    <span className="block text-sm font-semibold text-text-strong">{child.label}</span>
                    {child.description && (
                      <span className="mt-0.5 block text-xs leading-snug text-text-muted">{child.description}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => cn(linkBase, isActive && activeClass)}
          >
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
